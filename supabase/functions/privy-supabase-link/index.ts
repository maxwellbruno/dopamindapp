import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkRequestBody {
  email?: string;
  privy_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let body: LinkRequestBody = {};
    try {
      body = await req.json();
    } catch (_) {
      // ignore
    }

    const authHeader = req.headers.get('Authorization') || '';
    const privyToken = authHeader.replace('Bearer ', '').trim();

    // Optionally verify Privy token by fetching user info (best-effort)
    // If verification fails, we continue if an email was provided in the body
    let email = body.email?.toLowerCase().trim();
    let privy_id = body.privy_id;

    try {
      if (privyToken) {
        // Privy "me" endpoint to fetch the authenticated user
        const resp = await fetch('https://auth.privy.io/api/v1/users/me', {
          headers: { Authorization: `Bearer ${privyToken}` },
        });
        if (resp.ok) {
          const user = await resp.json();
          // Try common fields for email and id
          email = (user?.email?.address || user?.email || email || '').toLowerCase();
          privy_id = user?.id || user?.did || privy_id;
        }
      }
    } catch (_) {
      // Non-fatal: fallback to provided email
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure a Supabase user exists for this email (confirmed)
    const { data: existing, error: getErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: `email:${email}`
    });
    let supaUserId = existing?.users?.[0]?.id;

    if (getErr && getErr.message && !supaUserId) {
      // Continue, we'll create the user instead
    }

    if (!supaUserId) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { privy_id },
      });
      if (createErr || !created?.user) {
        return new Response(JSON.stringify({ error: createErr?.message || 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      supaUserId = created.user.id;
    }

    // Generate a one-time email OTP we can verify on the client to create a session
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { data: { privy_id } },
    });

    if (linkErr) {
      return new Response(JSON.stringify({ error: linkErr.message || 'Failed to generate link' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The OTP may be returned at different nesting levels depending on SDK version
    // Try a few common paths
    const email_otp = (linkData as any)?.properties?.email_otp || (linkData as any)?.email_otp || (linkData as any)?.otp || null;

    if (!email_otp) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve OTP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ email, email_otp }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('privy-supabase-link error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
