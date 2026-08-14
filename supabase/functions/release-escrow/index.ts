import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';
import { createWalletClient, createPublicClient, http, parseAbi } from 'https://esm.sh/viem@2.21.0';
import { privateKeyToAccount } from 'https://esm.sh/viem@2.21.0/accounts';
import { base } from 'https://esm.sh/viem@2.21.0/chains';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const erc20 = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const { bookingId } = await req.json().catch(() => ({}));
    if (!bookingId) return json({ error: 'bookingId is required' }, 400);

    const db = adminClient();
    const { data: booking } = await db
      .from('therapist_bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();
    if (!booking) return json({ error: 'Booking not found' }, 404);
    if (booking.client_user_id !== userId && booking.therapist_user_id !== userId) {
      return json({ error: 'Forbidden' }, 403);
    }

    const sessionEnd = new Date(booking.scheduled_start).getTime() + booking.duration_minutes * 60_000;
    const ended = booking.ended_at != null || Date.now() >= sessionEnd;
    if (!ended) return json({ error: 'The session has not ended yet.' }, 400);

    const { data: escrow } = await db
      .from('escrow_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();
    if (!escrow) return json({ error: 'Escrow record not found' }, 404);
    if (escrow.status === 'released') return json({ ok: true, alreadyReleased: true });
    if (escrow.status !== 'held') return json({ error: 'No funds are held for this session.' }, 400);

    const { data: therapist } = await db
      .from('therapists')
      .select('payout_wallet_address')
      .eq('id', booking.therapist_id)
      .maybeSingle();

    const payoutAddress = therapist?.payout_wallet_address;
    if (!payoutAddress || !/^0x[a-fA-F0-9]{40}$/.test(payoutAddress)) {
      return json({ error: 'The therapist has not set a valid payout wallet yet.' }, 400);
    }

    const pk = Deno.env.get('PLATFORM_ESCROW_PRIVATE_KEY');
    if (!pk) return json({ error: 'Escrow wallet is not configured.' }, 503);

    const account = privateKeyToAccount((pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`);
    const wallet = createWalletClient({ account, chain: base, transport: http() });
    const publicClient = createPublicClient({ chain: base, transport: http() });

    // 85% to the therapist; the 15% Dopamind fee stays in the platform wallet.
    const payoutUnits = BigInt(escrow.therapist_payout_cents) * 10_000n;

    const hash = await wallet.writeContract({
      address: USDC,
      abi: erc20,
      functionName: 'transfer',
      args: [payoutAddress as `0x${string}`, payoutUnits],
    });
    await publicClient.waitForTransactionReceipt({ hash });

    await db
      .from('escrow_payments')
      .update({ status: 'released', payout_tx_hash: hash, released_at: new Date().toISOString() })
      .eq('id', escrow.id);

    await db
      .from('therapist_bookings')
      .update({ status: 'completed', ended_at: booking.ended_at ?? new Date().toISOString() })
      .eq('id', bookingId);

    return json({ ok: true, payoutTxHash: hash });
  } catch (err) {
    console.error('release-escrow error', err);
    return json({ error: 'Payout failed. Please contact support.' }, 500);
  }
});
