import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "search_therapists",
  title: "Search therapist directory",
  description:
    "Search Mindfulnest's approved therapist directory. Optional filters: specialty (matches any of the therapist's specialties), language (substring match), location (substring match). Requires a Pro or Elite subscription, matching the app's therapist gate.",
  inputSchema: {
    specialty: z.string().optional().describe("Specialty to match, e.g. 'anxiety', 'trauma'."),
    language: z.string().optional().describe("Language substring, e.g. 'English', 'Spanish'."),
    location: z.string().optional().describe("Location substring, e.g. 'California', 'Lagos'."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ specialty, language, location, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);

    // Gate on subscription — mirrors the RequireTier gate on /therapists.
    const { data: sub } = await sb.rpc("get_user_subscription");
    const planId = ((sub as { plan_id?: string }[] | null)?.[0]?.plan_id ?? "").toLowerCase();
    if (!planId.includes("pro") && !planId.includes("elite")) {
      return errorResult("Searching therapists requires a Pro or Elite subscription.");
    }

    let q = sb
      .from("therapist_applications")
      .select(
        "id, full_name, title, credentials, bio, specialties, languages, location, price_range, session_types, years_of_experience",
      )
      .eq("status", "approved")
      .limit(limit);

    if (specialty) q = q.contains("specialties", [specialty]);
    if (language) q = q.ilike("languages", `%${language}%`);
    if (location) q = q.ilike("location", `%${location}%`);

    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return jsonResult({ therapists: data ?? [] });
  },
});
