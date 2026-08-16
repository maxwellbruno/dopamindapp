import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !serviceRole) return json({ error: 'Service not configured' }, 500);

    const admin = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let body: { email?: string; privy_id?: string } = {};
    try {
      body = await req.json();
    } catch (_) { /* ignore */ }

    const email = body.email?.toLowerCase().trim();
    const privy_id = body.privy_id;

    if (!email) return json({ error: 'Email is required' }, 400);

    // Create the user if they don't exist yet (ignore "already registered")
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { privy_id },
    });
    if (createErr && !/already|exists|registered/i.test(createErr.message)) {
      console.error('createUser failed', createErr.message);
      return json({ error: createErr.message }, 500);
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkErr) {
      console.error('generateLink failed', linkErr.message);
      return json({ error: linkErr.message }, 500);
    }

    const email_otp = (linkData as any)?.properties?.email_otp ?? null;
    if (!email_otp) return json({ error: 'Failed to retrieve OTP' }, 500);

    return json({ email, email_otp });
  } catch (e) {
    console.error('privy-supabase-link error', e);
    return json({ error: 'Internal server error' }, 500);
  }
});
