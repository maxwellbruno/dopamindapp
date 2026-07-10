import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "get_focus_stats",
  title: "Get focus stats",
  description:
    "Return the signed-in user's focus totals: total sessions, total focus minutes, current streak, and today's session count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const { data, error } = await supabaseForUser(ctx).rpc("get_user_focus_stats");
    if (error) return errorResult(error.message);
    return jsonResult({ stats: data });
  },
});
