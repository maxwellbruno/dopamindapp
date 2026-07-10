import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "get_mood_entry",
  title: "Get mood entry",
  description: "Fetch a single mood entry owned by the signed-in user by id.",
  inputSchema: {
    id: z.string().uuid().describe("Mood entry UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const { data, error } = await supabaseForUser(ctx)
      .from("mood_entries")
      .select("id, mood, intensity, note, date, activities, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Mood entry not found");
    return jsonResult({ entry: data });
  },
});
