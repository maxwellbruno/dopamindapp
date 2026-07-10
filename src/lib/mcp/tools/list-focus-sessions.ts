import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "list_focus_sessions",
  title: "List focus sessions",
  description: "List the signed-in user's completed focus sessions, most recent first.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("How many sessions to return (max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const { data, error } = await supabaseForUser(ctx)
      .from("focus_sessions")
      .select("id, name, duration, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return errorResult(error.message);
    return jsonResult({ sessions: data ?? [] });
  },
});
