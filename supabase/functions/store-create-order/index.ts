import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getCallerId } from '../_shared/auth.ts';

type Item = { productId: string; quantity: number };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const userId = await getCallerId(req);
    if (!userId) return json({ error: 'Please sign in again.' }, 401);

    const body = await req.json().catch(() => ({}));
    const items: Item[] = Array.isArray(body.items) ? body.items : [];
    const method = body.paymentMethod;
    const d = body.delivery ?? {};
    const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const delivery = {
      full_name: str(d.fullName, 120), phone: str(d.phone, 30), address: str(d.address), city: str(d.city, 100),
      delivery_notes: str(d.notes, 500) || null,
    };
    if (!['card', 'crypto'].includes(method)) return json({ error: 'Choose a payment method.' }, 400);
    if (!delivery.full_name || !delivery.phone || !delivery.address || !delivery.city) {
      return json({ error: 'Please fill in your delivery details.' }, 400);
    }
    if (items.length === 0 || items.length > 50) return json({ error: 'Your cart is empty.' }, 400);
    for (const i of items) {
      if (typeof i.productId !== 'string' || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 20) {
        return json({ error: 'Invalid cart item.' }, 400);
      }
    }

    const db = adminClient();
    const ids = items.map((i) => i.productId);
    const { data: products } = await db.from('store_products').select('*').in('id', ids).eq('is_active', true);
    const byId = new Map((products ?? []).map((p: any) => [p.id, p]));

    let total = 0;
    const lines = [];
    for (const i of items) {
      const p: any = byId.get(i.productId);
      if (!p) return json({ error: 'An item in your cart is no longer available.' }, 400);
      if (p.stock < i.quantity) return json({ error: `Only ${p.stock} of ${p.name} available right now.` }, 400);
      total += p.price_kes * i.quantity;
      lines.push({ product_id: p.id, name: p.name, emoji: p.emoji, unit_price_kes: p.price_kes, quantity: i.quantity });
    }

    let usdCents: number | null = null;
    if (method === 'crypto') {
      const { data: s } = await db.from('store_settings').select('kes_per_usd').eq('id', 1).single();
      const rate = Number(s?.kes_per_usd) || 129;
      usdCents = Math.ceil((total / rate) * 100);
    }

    const { data: order, error } = await db.from('store_orders').insert({
      user_id: userId, payment_method: method, total_kes: total, total_usd_cents: usdCents, ...delivery,
    }).select().single();
    if (error || !order) throw error;
    await db.from('store_order_items').insert(lines.map((l) => ({ ...l, order_id: order.id })));

    if (method === 'crypto') {
      const escrowAddress = Deno.env.get('PLATFORM_ESCROW_ADDRESS');
      if (!escrowAddress) return json({ error: 'Crypto payments are not set up yet.' }, 503);
      return json({ orderId: order.id, usdCents, escrowAddress });
    }

    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) return json({ error: 'Card payments are not set up yet.' }, 503);
    const { data: u } = await db.auth.admin.getUserById(userId);
    const email = u?.user?.email;
    if (!email) return json({ error: 'Your account needs an email address for card payments.' }, 400);

    const origin = req.headers.get('origin') ?? '';
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, amount: total * 100, currency: 'KES',
        callback_url: `${origin}/store/orders?placed=${order.id}`,
        metadata: { type: 'store_order', order_id: order.id, user_id: userId },
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
      }),
    });
    const ps = await res.json();
    if (!res.ok) return json({ error: ps.message || 'Could not start card payment.' }, 400);
    await db.from('store_orders').update({ paystack_reference: ps.data.reference }).eq('id', order.id);
    return json({ orderId: order.id, checkoutUrl: ps.data.authorization_url });
  } catch (err) {
    console.error('store-create-order error', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
