# Enable Supabase OAuth 2.1 + reconnect

This project is connected to an **external Supabase project** (`brgycopmuuanrrqmrdmf`), not Lovable Cloud. That means I can't flip the OAuth 2.1 authorization server on for you from here — it's a dashboard toggle on your Supabase account. Below is exactly what to do, and what I'll do after.

## What you do in Supabase

1. Open the project dashboard: https://supabase.com/dashboard/project/brgycopmuuanrrqmrdmf
2. Go to **Authentication → Sign In / Providers** (or **Auth → OAuth Server** depending on when your dashboard was updated).
3. Find **"OAuth 2.1 authorization server"** (currently in preview).
   - Toggle it **on**.
   - Enable **Dynamic Client Registration (DCR)** in the same panel.
   - Save.
4. If you don't see the option at all, it hasn't been enabled on your project yet — open a Supabase support ticket that says: *"Please enable the OAuth 2.1 authorization server (with dynamic client registration) on project `brgycopmuuanrrqmrdmf`."* Ping me back once they confirm.

## What I do after you confirm it's on

1. Re-run `app_mcp_server--extract_mcp_manifest` so Lovable's connector list picks up the now-verifiable MCP server.
2. Redeploy the `mcp` edge function with `supabase--deploy_edge_functions(["mcp"])` so it re-reads the freshly published OAuth discovery document.
3. Walk you through the end-to-end test: connect from Claude (or the Lovable connector picker), approve the consent screen while signed in, and call `list_mood_entries` to confirm RLS scopes correctly to your user.

## Notes

- No code changes are needed on my side — the MCP server, tools, consent route (`/.lovable/oauth/consent`), and OAuth issuer (`https://brgycopmuuanrrqmrdmf.supabase.co/auth/v1`) are already wired.
- "Reconnect the project in Lovable" isn't a separate action for an external Supabase connection — once OAuth 2.1 is on in the dashboard, the MCP endpoint starts verifying tokens correctly on the next request. No relink step in the Lovable UI is required.
- Nothing about your Privy login flow changes. `privy-supabase-link` already mints a Supabase session, so users hit the consent screen already signed in.

Reply once the toggle is on (or if you can't find it) and I'll run the manifest + redeploy steps.
