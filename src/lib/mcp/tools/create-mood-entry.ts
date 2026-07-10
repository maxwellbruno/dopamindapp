import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "create_mood_entry",
  title: "Log mood entry",
  description:
    "Log a new mood entry for the signed-in user. `mood` is a short label (e.g. 'happy', 'anxious', 'calm'), `intensity` is 1-10, `note` is optional free text, `date` defaults to today.",
  inputSchema: {
    mood: z.string().trim().min(1).max(64).describe("Mood label (e.g. happy, anxious, calm)."),
    intensity: z.number().int().min(1).max(10).describe("Intensity from 1 (weak) to 10 (strong)."),
    note: z.string().max(2000).optional().describe("Optional note about how the user feels."),
    date: z.string().optional().describe("ISO date (YYYY-MM-DD). Defaults to today."),
    activities: z.array(z.string()).optional().describe("Optional list of activities associated with the entry."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ mood, intensity, note, date, activities }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("mood_entries")
      .insert({
        user_id: ctx.getUserId()!,
        mood,
        intensity,
        note: note ?? null,
        date: date ?? new Date().toISOString().slice(0, 10),
        activities: activities ?? null,
      })
      .select("id, mood, intensity, note, date, activities, created_at")
      .single();
    if (error) return errorResult(error.message);
    // Bump the aggregate mood-entry counter (best-effort — mirrors app behavior).
    await sb.rpc("increment_mood_entries_count");
    return jsonResult({ entry: data });
  },
});
