import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helpers to work with JWT (ES256) in Deno WebCrypto
const encoder = new TextEncoder();

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  // btoa is available in Deno runtime
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importPkcs8EcPrivateKey(pem: string): Promise<CryptoKey> {
  // Expect PKCS#8 PEM: -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----
  const pemContents = pem
    .replace(/\r/g, '')
    .replace(/\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function createSessionToken({
  appId,
  keyId,
  privateKeyPem,
  walletAddress,
  asset,
  blockchain = "base",
  expiresInSec = 300,
}: {
  appId: string;
  keyId: string;
  privateKeyPem: string;
  walletAddress: string;
  asset: string;
  blockchain?: string;
  expiresInSec?: number;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", typ: "JWT", kid: keyId };
  // Payload fields are based on Coinbase Onramp "secure initialization" docs
  const payload: Record<string, unknown> = {
    iss: appId,
    aud: "coinbase:onramp",
    iat: now,
    nbf: now,
    exp: now + expiresInSec,
    // New initialization fields
    addresses: [walletAddress],
    assets: [asset.toUpperCase()],
    blockchains: [blockchain],
  };

  const encHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;

  const key = await importPkcs8EcPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    encoder.encode(signingInput),
  );

  const encSignature = base64UrlEncode(signature);
  return `${signingInput}.${encSignature}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) throw new Error("Unauthorized");

    const { walletAddress, amount, cryptoCurrency, fiatCurrency = "USD" } = await req.json();
    if (!walletAddress || !amount || !cryptoCurrency) {
      throw new Error("Missing required parameters: walletAddress, amount, cryptoCurrency");
    }

    const appId = Deno.env.get("COINBASE_ONRAMP_APP_ID");
    const keyId = Deno.env.get("COINBASE_ONRAMP_KEY_ID");
    const privateKey = Deno.env.get("COINBASE_ONRAMP_PRIVATE_KEY");
    if (!appId || !keyId || !privateKey) {
      throw new Error("Coinbase onramp credentials not configured");
    }

    // Create a secure session token for hosted Onramp
    const sessionToken = await createSessionToken({
      appId,
      keyId,
      privateKeyPem: privateKey,
      walletAddress,
      asset: cryptoCurrency,
      blockchain: "base",
    });

    // Build the new Onramp URL using updated params (addresses/assets + sessionToken)
    const url = new URL("https://pay.coinbase.com/onramp");
    url.searchParams.set("appId", appId);
    url.searchParams.set("addresses", walletAddress);
    url.searchParams.set("assets", cryptoCurrency.toUpperCase());
    url.searchParams.set("sessionToken", sessionToken);
    url.searchParams.set("fiatCurrency", fiatCurrency);
    url.searchParams.set("presetFiatAmount", String(amount));
    url.searchParams.set("defaultNetwork", "base");

    console.log("Generated Coinbase onramp URL for user:", authData.user.id);

    return new Response(
      JSON.stringify({ success: true, onrampUrl: url.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in coinbase-onramp function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message ?? "Internal server error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
