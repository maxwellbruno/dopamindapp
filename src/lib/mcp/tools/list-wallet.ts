import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "list_wallet",
  title: "List wallet addresses",
  description:
    "List the signed-in user's linked wallet addresses (Base network). Read-only — send, receive, and buy operations are not exposed over MCP; they stay in the Mindfulnest app.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const { data, error } = await supabaseForUser(ctx)
      .from("user_wallets")
      .select("id, wallet_address, wallet_provider, created_at")
      .eq("user_id", ctx.getUserId()!);
    if (error) return errorResult(error.message);
    return jsonResult({ wallets: data ?? [] });
  },
});
