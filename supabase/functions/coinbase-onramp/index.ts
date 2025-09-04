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
  // Accept multiple formats and normalize newlines
  // - PKCS#8 PEM (-----BEGIN PRIVATE KEY-----)
  // - Headerless base64 PKCS#8
  // - Env-stored PEM with escaped \n
  const normalized = (pem || '')
    .trim()
    // Convert escaped newlines ("\n") into real newlines
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '');

  // If the secret looks like JSON (JWK), try importing as JWK
  if (normalized.startsWith('{')) {
    try {
      const jwk = JSON.parse(normalized);
      return await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
      );
    } catch (e) {
      console.warn('Failed to import EC key as JWK, will try PEM/base64. Error:', e);
    }
  }

  // Strip PEM headers if present and remove whitespace
  const base64 = normalized
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');

  try {
    const binaryDer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  } catch (e) {
    console.error('Failed to import EC private key. Length:', base64.length);
    throw new Error('Invalid Coinbase private key format. Please provide a PKCS#8 PEM (BEGIN PRIVATE KEY) or a valid JWK for P-256.');
  }
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

  console.log("Coinbase onramp function called");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    console.log("Supabase client created");

    // Verify user
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    console.log("Auth verification result:", { hasUser: !!authData?.user, authError });
    if (authError || !authData?.user) throw new Error(`Unauthorized: ${authError?.message || 'No user'}`);

    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { walletAddress, amount, cryptoCurrency, fiatCurrency = "USD" } = requestBody;
    if (!walletAddress || !amount || !cryptoCurrency) {
      throw new Error("Missing required parameters: walletAddress, amount, cryptoCurrency");
    }

    const appId = Deno.env.get("COINBASE_ONRAMP_APP_ID");
    const keyId = Deno.env.get("COINBASE_ONRAMP_KEY_ID");
    const privateKey = Deno.env.get("COINBASE_ONRAMP_PRIVATE_KEY");
    
    console.log("Credentials check:", {
      hasAppId: !!appId,
      hasKeyId: !!keyId,
      hasPrivateKey: !!privateKey,
      appIdLength: appId?.length,
      keyIdLength: keyId?.length,
      privateKeyLength: privateKey?.length
    });
    
    if (!appId || !keyId || !privateKey) {
      console.error("Missing Coinbase credentials:", {
        missingAppId: !appId,
        missingKeyId: !keyId,
        missingPrivateKey: !privateKey
      });
      throw new Error("Coinbase onramp credentials not configured. Please check your Supabase secrets.");
    }

    console.log("Creating session token...");
    
    // Create a secure session token for hosted Onramp
    const sessionToken = await createSessionToken({
      appId,
      keyId,
      privateKeyPem: privateKey,
      walletAddress,
      asset: cryptoCurrency,
      blockchain: "base",
    });

    console.log("Session token created successfully");

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
    console.log("Final URL:", url.toString());

    return new Response(
      JSON.stringify({ success: true, onrampUrl: url.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in coinbase-onramp function:", error);
    console.error("Error stack:", error.stack);
    
    // Return more detailed error information
    const errorMessage = error?.message || "Internal server error";
    const errorDetails = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    console.error("Returning error:", errorDetails);
    
    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: error?.message?.includes("credentials") ? 503 : 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      },
    );
  }
});
