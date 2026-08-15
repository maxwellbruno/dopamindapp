import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import type { TherapistRow } from '@/hooks/useTherapistProfile';
import { formatUsd, payEscrowUsdc, PLATFORM_FEE_BPS } from '@/lib/escrow';
import RequireTier from '@/components/RequireTier';

const DURATIONS = [30, 60, 90];
const MODES: { value: string; label: string }[] = [
  { value: 'video', label: 'Video call' },
  { value: 'voice', label: 'Voice call' },
  { value: 'chat', label: 'Chat & voice notes' },
];

const defaultSlot = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const BookSessionInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { wallets } = useWallets();

  const [start, setStart] = useState(defaultSlot());
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState('video');
  const [step, setStep] = useState<'idle' | 'booking' | 'paying' | 'confirming'>('idle');

  const { data: therapist } = useQuery({
    queryKey: ['therapist', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('therapists').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return (data as TherapistRow) ?? null;
    },
    enabled: !!id,
  });

  const amountCents = useMemo(
    () => (therapist ? therapist.rate_cents_per_30min * (duration / 30) : 0),
    [therapist, duration],
  );
  const feeCents = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);

  const handleBook = async () => {
    if (!therapist) return;
    if (!wallet?.address) {
      toast.error('Set up your Dopamind wallet first', { description: 'Open Wallet from your profile to create it.' });
      return;
    }

    try {
      setStep('booking');
      const { data, error } = await supabase.functions.invoke('book-therapy-session', {
        body: {
          therapistId: therapist.id,
          scheduledStart: new Date(start).toISOString(),
          durationMinutes: duration,
          sessionMode: mode,
        },
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message ?? 'Booking failed');

      const bookingId = data.booking.id as string;
      const escrowAddress = data.escrowAddress as string | null;
      if (!escrowAddress) {
        toast.error('Payments are not live yet', { description: 'The Dopamind escrow wallet has not been configured.' });
        setStep('idle');
        return;
      }

      setStep('paying');
      const txHash = await payEscrowUsdc({
        wallets: wallets as any[],
        fromAddress: wallet.address,
        escrowAddress,
        amountCents: data.booking.amount_cents,
      });

      setStep('confirming');
      const confirm = await supabase.functions.invoke('confirm-escrow-deposit', { body: { bookingId, txHash } });
      if (confirm.error || confirm.data?.error) {
        toast.error('Payment sent, verification pending', {
          description: 'We will confirm your deposit shortly. You can check the session in My sessions.',
        });
      } else {
        toast.success('Session booked', { description: 'Your payment is held in escrow until the session ends.' });
      }
      navigate(`/sessions/${bookingId}`);
    } catch (err: any) {
      console.error('Booking failed', err);
      toast.error(err?.message ?? 'Could not complete the booking.');
      setStep('idle');
    }
  };

  const busy = step !== 'idle';

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(`/therapists/${id}`)}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Book a session</h1>
          </div>

          {!therapist ? (
            <div className="dopamind-card p-8 text-center text-text-light text-sm">Loading...</div>
          ) : (
            <div className="dopamind-card p-6 space-y-6">
              <div>
                <p className="text-sm text-text-light">Therapist</p>
                <p className="text-lg font-bold text-text-dark">{therapist.full_name}</p>
                <p className="text-sm text-mint-green font-semibold">{therapist.title}</p>
              </div>

              <div>
                <label htmlFor="slot" className="block text-sm font-semibold text-text-dark mb-2">Date & time</label>
                <input
                  id="slot"
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 text-text-dark"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-dark mb-2">Duration</p>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-2xl py-3 text-sm font-semibold border-2 transition-colors ${
                        duration === d ? 'border-mint-green bg-mint-green/10 text-mint-green' : 'border-gray-200 text-text-dark'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-text-dark mb-2">Session type</p>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold border-2 transition-colors ${
                        mode === m.value ? 'border-deep-blue bg-deep-blue/10 text-deep-blue' : 'border-gray-200 text-text-dark'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-light-gray rounded-2xl p-4 space-y-1">
                <div className="flex justify-between text-sm text-text-light">
                  <span>Session price</span>
                  <span className="font-semibold text-text-dark">{formatUsd(amountCents)} USDC</span>
                </div>
                <div className="flex justify-between text-sm text-text-light">
                  <span>Includes Dopamind fee (15%)</span>
                  <span>{formatUsd(feeCents)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-light">
                  <span>Therapist receives</span>
                  <span>{formatUsd(amountCents - feeCents)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-text-light">
                <ShieldCheck className="w-4 h-4 text-mint-green flex-shrink-0 mt-0.5" />
                <p>
                  Your USDC is held in Dopamind escrow on Base and only released to the therapist after the session ends.
                </p>
              </div>

              <button
                onClick={handleBook}
                disabled={busy}
                className="w-full bg-mint-green text-white font-semibold rounded-2xl py-4 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === 'idle' && `Pay ${formatUsd(amountCents)} in USDC`}
                {step === 'booking' && 'Reserving your slot...'}
                {step === 'paying' && 'Confirm the payment in your wallet...'}
                {step === 'confirming' && 'Verifying your deposit...'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookSession: React.FC = () => (
  <RequireTier
    tier="pro"
    feature="Book a Real Therapist"
    description="Booking sessions with licensed therapists is a Pro feature."
  >
    <BookSessionInner />
  </RequireTier>
);

export default BookSession;
