import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "get_therapist",
  title: "Get therapist details",
  description:
    "Fetch full public details for an approved therapist by id. Requires a Pro or Elite subscription.",
  inputSchema: {
    id: z.string().uuid().describe("Therapist application UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    const { data: sub } = await sb.rpc("get_user_subscription");
    const planId = ((sub as { plan_id?: string }[] | null)?.[0]?.plan_id ?? "").toLowerCase();
    if (!planId.includes("pro") && !planId.includes("elite")) {
      return errorResult("Viewing therapist details requires a Pro or Elite subscription.");
    }

    const { data, error } = await sb
      .from("therapist_applications")
      .select(
        "id, full_name, title, credentials, bio, specialties, languages, location, price_range, session_types, years_of_experience, linkedin_url",
      )
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (error) return errorResult(error.message);
    if (!data) return errorResult("Therapist not found or not approved.");
    return jsonResult({ therapist: data });
  },
});
