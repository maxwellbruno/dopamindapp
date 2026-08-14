import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';

const PLATFORM_FEE_BPS = 1500; // 15%
const MIN_CENTS_PER_30MIN = 1000; // $10

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => null);
    const therapistId: string | undefined = body?.therapistId;
    const scheduledStart: string | undefined = body?.scheduledStart;
    const durationMinutes = Number(body?.durationMinutes ?? 30);
    const sessionMode: string = body?.sessionMode ?? 'video';

    if (!therapistId || !scheduledStart) return json({ error: 'therapistId and scheduledStart are required' }, 400);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes % 30 !== 0) {
      return json({ error: 'Sessions must be booked in 30-minute blocks (minimum 30 minutes).' }, 400);
    }
    const startDate = new Date(scheduledStart);
    if (isNaN(startDate.getTime())) return json({ error: 'Invalid scheduledStart' }, 400);
    if (startDate.getTime() < Date.now() - 60_000) return json({ error: 'Pick a future time slot.' }, 400);
    if (!['video', 'voice', 'chat'].includes(sessionMode)) return json({ error: 'Invalid session mode' }, 400);

    const db = adminClient();
    const { data: therapist, error: tErr } = await db
      .from('therapists')
      .select('id, user_id, rate_cents_per_30min, is_published, is_accepting_clients, payout_wallet_address')
      .eq('id', therapistId)
      .maybeSingle();

    if (tErr || !therapist) return json({ error: 'Therapist not found' }, 404);
    if (!therapist.is_published || !therapist.is_accepting_clients) {
      return json({ error: 'This therapist is not accepting new sessions right now.' }, 400);
    }
    if (therapist.user_id === userId) return json({ error: 'You cannot book a session with yourself.' }, 400);

    const rate = Math.max(MIN_CENTS_PER_30MIN, therapist.rate_cents_per_30min);
    const amountCents = rate * (durationMinutes / 30);
    const platformFeeCents = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
    const payoutCents = amountCents - platformFeeCents;

    const { data: booking, error: bErr } = await db
      .from('therapist_bookings')
      .insert({
        therapist_id: therapist.id,
        therapist_user_id: therapist.user_id,
        client_user_id: userId,
        scheduled_start: startDate.toISOString(),
        duration_minutes: durationMinutes,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        session_mode: sessionMode,
        status: 'pending_payment',
      })
      .select()
      .single();

    if (bErr || !booking) {
      console.error('Booking insert failed', bErr);
      return json({ error: 'Could not create booking.' }, 500);
    }

    const { data: escrow, error: eErr } = await db
      .from('escrow_payments')
      .insert({
        booking_id: booking.id,
        client_user_id: userId,
        therapist_user_id: therapist.user_id,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        therapist_payout_cents: payoutCents,
        status: 'awaiting_deposit',
      })
      .select()
      .single();

    if (eErr) console.error('Escrow insert failed', eErr);

    return json({
      booking,
      escrow,
      escrowAddress: Deno.env.get('PLATFORM_ESCROW_ADDRESS') ?? null,
      amountUsd: amountCents / 100,
      platformFeeUsd: platformFeeCents / 100,
    });
  } catch (err) {
    console.error('book-therapy-session error', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
