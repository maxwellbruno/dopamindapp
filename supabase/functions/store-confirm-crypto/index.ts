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
    const { orderId, txHash } = await req.json().catch(() => ({}));
    if (typeof orderId !== 'string' || !/^0x[a-fA-F0-9]{64}$/.test(txHash ?? '')) {
      return json({ error: 'orderId and a valid txHash are required' }, 400);
    }
    const escrow = (Deno.env.get('PLATFORM_ESCROW_ADDRESS') ?? '').toLowerCase();
    if (!escrow) return json({ error: 'Crypto payments are not set up yet.' }, 503);

    const db = adminClient();
    const { data: order } = await db.from('store_orders').select('*').eq('id', orderId).maybeSingle();
    if (!order) return json({ error: 'Order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (order.status !== 'pending') return json({ ok: true, alreadyConfirmed: true });

    const { data: used } = await db.from('store_orders').select('id').eq('tx_hash', txHash).maybeSingle();
    if (used) return json({ error: 'This transaction was already used.' }, 400);

    const client = createPublicClient({ chain: base, transport: http() });
    const receipt = await client.waitForTransactionReceipt({ hash: txHash as `0x${string}`, timeout: 45_000 });
    if (receipt.status !== 'success') return json({ error: 'Transaction failed on-chain.' }, 400);

    const required = BigInt(order.total_usd_cents ?? 0) * 10_000n;
    let received = 0n;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC) continue;
      try {
        const ev = decodeEventLog({ abi: transferAbi, data: log.data, topics: log.topics });
        if (ev.eventName === 'Transfer' && String(ev.args.to).toLowerCase() === escrow) received += ev.args.value as bigint;
      } catch (_) { /* skip */ }
    }
    if (received < required) return json({ error: 'Payment amount does not cover the order total.' }, 400);

    await db.rpc('mark_store_order_paid', { _order_id: orderId, _tx_hash: txHash });
    return json({ ok: true });
  } catch (err) {
    console.error('store-confirm-crypto error', err);
    return json({ error: 'Could not verify the payment yet. Please try again shortly.' }, 500);
  }
});
