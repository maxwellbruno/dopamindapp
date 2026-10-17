import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallets } from '@privy-io/react-auth';
import { ArrowLeft, CreditCard, Wallet as WalletIcon, Wind } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/hooks/useWallet';
import { formatKes, useStoreSettings } from '@/lib/store';
import { payEscrowUsdc, formatUsd } from '@/lib/escrow';

const StoreCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { lines, totalKes, clear } = useCart();
  const { data: settings } = useStoreSettings();
  const { wallet } = useWallet();
  const { wallets } = useWallets();
  const [method, setMethod] = useState<'card' | 'crypto'>('card');
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', notes: '' });
  const [pauseOpen, setPauseOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const rate = Number(settings?.kes_per_usd) || 129;
  const usdCents = Math.ceil((totalKes / rate) * 100);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const startPause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error('Please fill in your delivery details.');
      return;
    }
    if (method === 'crypto' && !wallet?.address) {
      toast.error('Open your Wallet first so your Dopamind wallet is ready.');
      return;
    }
    setPauseOpen(true);
  };

  const pay = async () => {
    setPauseOpen(false);
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('store-create-order', {
        body: {
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          paymentMethod: method,
          delivery: form,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      if (method === 'card') {
        clear();
        window.location.href = data.checkoutUrl;
        return;
      }

      const txHash = await payEscrowUsdc({
        wallets: wallets as any[],
        fromAddress: wallet!.address!,
        escrowAddress: data.escrowAddress,
        amountCents: data.usdCents,
      });
      toast.message('Payment sent. Confirming gently…');
      const confirm = await supabase.functions.invoke('store-confirm-crypto', { body: { orderId: data.orderId, txHash } });
      if (confirm.error || confirm.data?.error) throw new Error(confirm.data?.error || 'Could not confirm payment yet.');
      clear();
      navigate(`/store/orders?placed=${data.orderId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Your basket is empty.</p>
        <Button onClick={() => navigate('/store')} className="rounded-full">Back to the store</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background px-4 pt-8 md:pt-0 pb-28">
      <div className="max-w-md md:max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/store')} className="rounded-full" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        </div>

        <form onSubmit={startPause} className="space-y-6">
          <section className="dopamind-card p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Your basket</h2>
            {lines.map((l) => (
              <div key={l.productId} className="flex justify-between text-sm">
                <span className="text-foreground">{l.emoji} {l.name} × {l.quantity}</span>
                <span className="text-muted-foreground">{formatKes(l.priceKes * l.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-foreground">
              <span>Total</span><span>{formatKes(totalKes)}</span>
            </div>
          </section>

          <section className="dopamind-card p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Delivery</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label htmlFor="fn">Full name</Label><Input id="fn" value={form.fullName} onChange={update('fullName')} maxLength={120} required /></div>
              <div><Label htmlFor="ph">Phone</Label><Input id="ph" type="tel" value={form.phone} onChange={update('phone')} maxLength={30} required /></div>
            </div>
            <div><Label htmlFor="ad">Address</Label><Input id="ad" value={form.address} onChange={update('address')} maxLength={300} required /></div>
            <div><Label htmlFor="ci">City / Town</Label><Input id="ci" value={form.city} onChange={update('city')} maxLength={100} required /></div>
            <div><Label htmlFor="no">Delivery notes (optional)</Label><Textarea id="no" value={form.notes} onChange={update('notes')} maxLength={500} rows={2} /></div>
          </section>

          <section className="dopamind-card p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Payment</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'card', icon: CreditCard, title: 'Card / M-Pesa', sub: formatKes(totalKes) },
                { id: 'crypto', icon: WalletIcon, title: 'Crypto (USDC)', sub: `≈ ${formatUsd(usdCents)}` },
              ] as const).map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setMethod(o.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition-colors duration-500 ${
                    method === o.id ? 'border-mint-green bg-mint-green/10' : 'border-border bg-card'
                  }`}
                >
                  <o.icon className="w-5 h-5 text-mint-green mb-2" />
                  <p className="text-sm font-medium text-foreground">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.sub}</p>
                </button>
              ))}
            </div>
            {method === 'crypto' && (
              <p className="text-xs text-muted-foreground">Paid from your Dopamind wallet on Base. Rate: KES {rate} = $1.</p>
            )}
          </section>

          <Button type="submit" disabled={busy} className="w-full rounded-full bg-mint-green hover:bg-mint-green/90 text-primary-foreground h-12">
            {busy ? 'Processing…' : 'Place order'}
          </Button>
        </form>
      </div>

      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-mint-green/15 flex items-center justify-center mb-2 animate-pulse">
              <Wind className="w-6 h-6 text-mint-green" />
            </div>
            <DialogTitle className="text-center">Take a breath</DialogTitle>
            <DialogDescription className="text-center">
              Breathe in for four, out for six. Does this order truly serve you?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setPauseOpen(false)}>Not yet</Button>
            <Button className="flex-1 rounded-full bg-mint-green hover:bg-mint-green/90 text-primary-foreground" onClick={pay}>Yes, continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreCheckout;
