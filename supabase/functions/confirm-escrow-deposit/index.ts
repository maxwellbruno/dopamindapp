import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';
import { createPublicClient, http, decodeEventLog, parseAbi } from 'https://esm.sh/viem@2.21.0';
import { base } from 'https://esm.sh/viem@2.21.0/chains';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase();
const transferAbi = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const { bookingId, txHash } = await req.json().catch(() => ({}));
    if (!bookingId || !/^0x[a-fA-F0-9]{64}$/.test(txHash ?? '')) {
      return json({ error: 'bookingId and a valid txHash are required' }, 400);
    }

    const escrowAddress = (Deno.env.get('PLATFORM_ESCROW_ADDRESS') ?? '').toLowerCase();
    if (!escrowAddress) return json({ error: 'Escrow wallet is not configured.' }, 503);

    const db = adminClient();
    const { data: escrow } = await db
      .from('escrow_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (!escrow) return json({ error: 'Escrow record not found' }, 404);
    if (escrow.client_user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (escrow.status !== 'awaiting_deposit') return json({ escrow, alreadyConfirmed: true });

    const client = createPublicClient({ chain: base, transport: http() });
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (receipt.status !== 'success') return json({ error: 'Transaction failed on-chain.' }, 400);

    // Required USDC (6 decimals) = cents * 10^4
    const required = BigInt(escrow.amount_cents) * 10_000n;
    let received = 0n;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC) continue;
      try {
        const decoded = decodeEventLog({ abi: transferAbi, data: log.data, topics: log.topics });
        if (decoded.eventName === 'Transfer' && String(decoded.args.to).toLowerCase() === escrowAddress) {
          received += decoded.args.value as bigint;
        }
      } catch (_) { /* not a Transfer log */ }
    }

    if (received < required) {
      return json({ error: 'Deposit amount does not cover the session price.', received: received.toString() }, 400);
    }

    await db
      .from('escrow_payments')
      .update({ status: 'held', deposit_tx_hash: txHash })
      .eq('id', escrow.id);

    await db
      .from('therapist_bookings')
      .update({ status: 'scheduled' })
      .eq('id', bookingId);

    return json({ ok: true });
  } catch (err) {
    console.error('confirm-escrow-deposit error', err);
    return json({ error: 'Could not verify the deposit. Please try again in a moment.' }, 500);
  }
});
