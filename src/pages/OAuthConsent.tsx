import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Local typed wrapper for the Supabase Auth OAuth 2.1 (beta) namespace so
// TypeScript doesn't complain if the surface isn't in @supabase/supabase-js yet.
type OAuthNs = {
  getAuthorizationDetails(id: string): Promise<{
    data: { redirect_url?: string; redirect_to?: string; client?: { name?: string; client_uri?: string } } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization(id: string): Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization(id: string): Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function getOAuthApi(): OAuthNs | null {
  const authNs = (supabase.auth as unknown) as { oauth?: OAuthNs };
  return authNs.oauth ?? null;
}

type AuthDetails = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; client_uri?: string };
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const oauth = getOAuthApi();
      if (!oauth) {
        setError(
          "This Supabase project does not have OAuth 2.1 enabled. Enable the OAuth 2.1 authorization server in the Supabase dashboard and reconnect the project.",
        );
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // AppContent renders AuthScreen for any unauthenticated route; after
        // login the user lands back here on this same URL.
        return;
      }
      const { data, error: err } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) return setError(err.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    const oauth = getOAuthApi();
    if (!oauth) return;
    setBusy(true);
    const { data, error: err } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  const wrap =
    "min-h-screen flex items-center justify-center p-6 bg-light-gray dark:bg-deep-blue text-text-dark dark:text-white";

  if (error) {
    return (
      <main className={wrap}>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow">
          <h1 className="text-xl font-bold mb-2">Couldn't load this request</h1>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className={wrap}>
        <p>Loading authorization request…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "An app";
  return (
    <main className={wrap}>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow space-y-4">
        <h1 className="text-2xl font-bold">Connect {clientName} to your Mindfulnest account</h1>
        <p className="text-sm opacity-80">
          {clientName} is asking to access Mindfulnest as you. It will be able to read and write only your own data —
          mood entries, focus sessions, profile, wallet addresses, and the therapist directory — following the same
          rules the app uses.
        </p>
        {details.client?.client_uri && (
          <p className="text-xs opacity-60 break-all">Client: {details.client.client_uri}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button disabled={busy} onClick={() => decide(true)} className="flex-1 bg-mint-green text-white">
            Approve
          </Button>
          <Button disabled={busy} onClick={() => decide(false)} variant="outline" className="flex-1">
            Deny
          </Button>
        </div>
      </div>
    </main>
  );
}
