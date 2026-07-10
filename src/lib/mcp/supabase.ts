import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * Build a Supabase client that runs as the MCP caller. The verified access
 * token is forwarded so RLS applies as that user. Never reference
 * SUPABASE_SERVICE_ROLE_KEY here — an MCP tool must not bypass RLS.
 */
export function supabaseForUser(ctx: ToolContext) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function unauthorized() {
  return {
    isError: true,
    content: [{ type: "text" as const, text: "Not authenticated" }],
  };
}

export function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function jsonResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
    structuredContent: { value } as Record<string, unknown>,
  };
}
