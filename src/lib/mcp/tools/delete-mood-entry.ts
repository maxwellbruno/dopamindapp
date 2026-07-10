import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "delete_mood_entry",
  title: "Delete mood entry",
  description: "Permanently delete one of the signed-in user's mood entries by id.",
  inputSchema: {
    id: z.string().uuid().describe("Mood entry UUID to delete."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const { error } = await supabaseForUser(ctx).from("mood_entries").delete().eq("id", id);
    if (error) return errorResult(error.message);
    return jsonResult({ deleted: id });
  },
});
