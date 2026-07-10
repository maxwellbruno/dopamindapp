import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "create_focus_session",
  title: "Log focus session",
  description:
    "Log a completed focus session for the signed-in user. `duration` is in minutes. Also updates streak and totals.",
  inputSchema: {
    name: z.string().trim().min(1).max(128).describe("Session label, e.g. 'Deep work', 'Study'."),
    duration: z.number().int().min(1).max(600).describe("Session length in minutes (max 600)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, duration }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("focus_sessions")
      .insert({ user_id: ctx.getUserId()!, name, duration })
      .select("id, name, duration, created_at")
      .single();
    if (error) return errorResult(error.message);
    await sb.rpc("update_user_stats_on_session_complete", { session_duration: duration });
    return jsonResult({ session: data });
  },
});
