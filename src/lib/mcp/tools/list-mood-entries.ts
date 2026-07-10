import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "list_mood_entries",
  title: "List mood entries",
  description:
    "List the signed-in user's recent mood entries, most recent first. Each entry has id, mood, intensity (1-10), note, date, and activities.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("How many entries to return (max 100)."),
    since: z.string().optional().describe("Optional ISO date (YYYY-MM-DD). Only return entries on or after this date."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, since }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    let q = supabaseForUser(ctx)
      .from("mood_entries")
      .select("id, mood, intensity, note, date, activities, created_at")
      .order("date", { ascending: false })
      .limit(limit);
    if (since) q = q.gte("date", since);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return jsonResult({ entries: data ?? [] });
  },
});
