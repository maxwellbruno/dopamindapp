import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient } from '../_shared/auth.ts';

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const secret = Deno.env.get('PERSONA_WEBHOOK_SECRET');
  const raw = await req.text();

  if (secret) {
    const header = req.headers.get('Persona-Signature') || '';
    const parts = Object.fromEntries(
      header.split(',').map((p) => p.trim().split('=') as [string, string]),
    );
    const t = parts['t'];
    const v1 = parts['v1'];
    if (!t || !v1) return json({ error: 'Missing signature' }, 401);
    const expected = await hmacSha256Hex(secret, `${t}.${raw}`);
    if (expected !== v1) {
      console.error('Persona signature mismatch');
      return json({ error: 'Invalid signature' }, 401);
    }
  } else {
    console.warn('PERSONA_WEBHOOK_SECRET not set — skipping signature verification');
  }

  try {
    const payload = JSON.parse(raw);
    const attrs = payload?.data?.attributes ?? {};
    const eventName: string = attrs?.name ?? '';
    const inquiry = attrs?.payload?.data;
    const inquiryId: string | undefined = inquiry?.id;
    const inquiryStatus: string | undefined = inquiry?.attributes?.status;
    const referenceId: string | undefined = inquiry?.attributes?.['reference-id'];

    console.log('Persona webhook', { eventName, inquiryId, inquiryStatus, referenceId });
    if (!inquiryId && !referenceId) return json({ received: true });

    const db = adminClient();
    let query = db.from('therapist_applications').select('id, user_id, status').limit(1);
    query = inquiryId ? query.eq('persona_inquiry_id', inquiryId) : query.eq('user_id', referenceId!);
    const { data: rows } = await query;
    const application = rows?.[0];
    if (!application) return json({ received: true });

    const passed = inquiryStatus === 'approved' || inquiryStatus === 'completed';
    const failed = inquiryStatus === 'declined' || inquiryStatus === 'failed' || inquiryStatus === 'expired';

    const update: Record<string, unknown> = {
      persona_inquiry_id: inquiryId ?? undefined,
      persona_status: inquiryStatus ?? eventName,
    };

    if (passed) {
      update.kyc_status = 'passed';
      update.persona_completed_at = new Date().toISOString();
      update.status = 'pending_review';
    } else if (failed) {
      update.kyc_status = 'failed';
      update.persona_completed_at = new Date().toISOString();
      update.status = 'kyc_failed';
    } else {
      update.kyc_status = 'pending';
      update.status = 'kyc_pending';
    }

    const { error } = await db.from('therapist_applications').update(update).eq('id', application.id);
    if (error) console.error('Failed to update application from Persona webhook', error);

    return json({ received: true });
  } catch (err) {
    console.error('persona-webhook error', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
