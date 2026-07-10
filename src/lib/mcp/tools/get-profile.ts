import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get profile & subscription",
  description:
    "Return the signed-in user's profile summary: email (from token), subscription plan/status, wellness stats (total sessions, focus minutes, current streak, mood entries), task streaks, and total dopamine rewards.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    const uid = ctx.getUserId()!;

    const [subRes, statsRes, streaksRes, rewardsRes] = await Promise.all([
      sb.rpc("get_user_subscription"),
      sb.from("user_stats").select("*").eq("user_id", uid).maybeSingle(),
      sb.from("user_task_streaks").select("task_type, current_streak, total_completions, last_completed_date").eq("user_id", uid),
      sb.from("dopamine_rewards").select("amount").eq("user_id", uid),
    ]);

    if (subRes.error) return errorResult(subRes.error.message);
    if (statsRes.error) return errorResult(statsRes.error.message);
    if (streaksRes.error) return errorResult(streaksRes.error.message);
    if (rewardsRes.error) return errorResult(rewardsRes.error.message);

    const totalRewards = (rewardsRes.data ?? []).reduce((sum, r: { amount: number }) => sum + (r.amount ?? 0), 0);

    return jsonResult({
      user: {
        id: uid,
        email: ctx.getUserEmail() ?? null,
      },
      subscription: (subRes.data as unknown[])?.[0] ?? null,
      stats: statsRes.data ?? null,
      task_streaks: streaksRes.data ?? [],
      total_rewards: totalRewards,
    });
  },
});
