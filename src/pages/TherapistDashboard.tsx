import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Wallet as WalletIcon, Star, Gauge, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTherapistProfile } from '@/hooks/useTherapistProfile';
import { useWallet } from '@/hooks/useWallet';
import { formatUsd, MIN_RATE_CENTS } from '@/lib/escrow';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { therapist, application, isLoading, refetch } = useTherapistProfile();

  const [rate, setRate] = useState('10');
  const [bio, setBio] = useState('');
  const [payout, setPayout] = useState('');
  const [accepting, setAccepting] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!therapist) return;
    setRate((therapist.rate_cents_per_30min / 100).toString());
    setBio(therapist.bio ?? '');
    setPayout(therapist.payout_wallet_address ?? wallet?.address ?? '');
    setAccepting(therapist.is_accepting_clients);
  }, [therapist, wallet?.address]);

  const { data: bookings = [] } = useQuery({
    queryKey: ['therapist-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapist_bookings')
        .select('*')
        .eq('therapist_user_id', user!.id)
        .order('scheduled_start', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!therapist,
  });

  const { data: earnings } = useQuery({
    queryKey: ['therapist-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escrow_payments')
        .select('status, therapist_payout_cents')
        .eq('therapist_user_id', user!.id);
      if (error) throw error;
      const released = (data ?? []).filter((e) => e.status === 'released').reduce((s, e) => s + e.therapist_payout_cents, 0);
      const held = (data ?? []).filter((e) => e.status === 'held').reduce((s, e) => s + e.therapist_payout_cents, 0);
      return { released, held };
    },
    enabled: !!user && !!therapist,
  });

  const save = async () => {
    if (!therapist) return;
    const rateCents = Math.round(parseFloat(rate || '0') * 100);
    if (!Number.isFinite(rateCents) || rateCents < MIN_RATE_CENTS) {
      return toast.error(`Minimum rate is ${formatUsd(MIN_RATE_CENTS)} per 30 minutes.`);
    }
    if (payout && !/^0x[a-fA-F0-9]{40}$/.test(payout)) {
      return toast.error('Enter a valid Base wallet address (0x...).');
    }
    setSaving(true);
    const { error } = await supabase
      .from('therapists')
      .update({
        rate_cents_per_30min: rateCents,
        bio,
        payout_wallet_address: payout || null,
        is_accepting_clients: accepting,
      })
      .eq('id', therapist.id);
    setSaving(false);
    if (error) return toast.error('Could not save your profile.');
    toast.success('Profile updated');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-text-light text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!therapist) {
    const status = (application as any)?.status;
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center max-w-sm w-full">
          <h1 className="text-lg font-bold text-text-dark mb-2">Therapist dashboard</h1>
          <p className="text-text-light text-sm mb-4">
            {status
              ? `Your application is currently "${String(status).replace('_', ' ')}". You will get access to the dashboard once your identity and credentials are approved.`
              : 'This dashboard unlocks once your therapist application is approved.'}
          </p>
          <button
            onClick={() => navigate(status ? '/therapists' : '/therapists/apply')}
            className="bg-mint-green text-white font-semibold rounded-2xl px-6 py-2.5"
          >
            {status ? 'Back to directory' : 'Apply now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-3xl mx-auto space-y-4">
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate('/profile')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-dark">Therapist dashboard</h1>
              <p className="text-text-light text-sm">{therapist.full_name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="dopamind-card p-4">
              <div className="flex items-center text-text-light text-xs mb-1">
                <WalletIcon className="w-4 h-4 mr-1" /> Paid out
              </div>
              <p className="text-xl font-bold text-text-dark">{formatUsd(earnings?.released ?? 0)}</p>
            </div>
            <div className="dopamind-card p-4">
              <div className="flex items-center text-text-light text-xs mb-1">
                <CalendarClock className="w-4 h-4 mr-1" /> In escrow
              </div>
              <p className="text-xl font-bold text-text-dark">{formatUsd(earnings?.held ?? 0)}</p>
            </div>
            <div className="dopamind-card p-4">
              <div className="flex items-center text-text-light text-xs mb-1">
                <Star className="w-4 h-4 mr-1" /> Rating
              </div>
              <p className="text-xl font-bold text-text-dark">
                {therapist.rating_avg.toFixed(1)} <span className="text-sm text-text-light">({therapist.rating_count})</span>
              </p>
            </div>
            <div className="dopamind-card p-4">
              <div className="flex items-center text-text-light text-xs mb-1">
                <Gauge className="w-4 h-4 mr-1" /> Score
              </div>
              <p className="text-xl font-bold text-text-dark">{Math.round(therapist.score)}/100</p>
            </div>
          </div>

          {/* Profile settings */}
          <div className="dopamind-card p-6 space-y-4">
            <h2 className="text-base font-bold text-text-dark">Profile & pricing</h2>
            <div>
              <label htmlFor="rate" className="block text-sm font-semibold text-text-dark mb-1">
                Rate per 30 minutes (USD, minimum $10)
              </label>
              <Input id="rate" type="number" min="10" step="1" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-text-dark mb-1">Bio</label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1500} />
            </div>
            <div>
              <label htmlFor="payout" className="block text-sm font-semibold text-text-dark mb-1">
                Payout wallet (USDC on Base)
              </label>
              <Input id="payout" value={payout} onChange={(e) => setPayout(e.target.value)} placeholder="0x..." />
              <p className="text-xs text-text-light mt-1">Escrowed session fees are sent here after each session, minus the 15% Dopamind fee.</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-dark">Accepting new clients</p>
                <p className="text-xs text-text-light">Turn off to pause new bookings.</p>
              </div>
              <Switch checked={accepting} onCheckedChange={setAccepting} />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-mint-green text-white font-semibold rounded-2xl py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
            </button>
          </div>

          {/* Sessions */}
          <div className="dopamind-card p-6">
            <h2 className="text-base font-bold text-text-dark mb-3">Sessions</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-text-light">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/sessions/${b.id}`)}
                    className="w-full text-left bg-light-gray rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-dark">{new Date(b.scheduled_start).toLocaleString()}</p>
                      <span className="text-xs font-semibold text-deep-blue capitalize">{String(b.status).replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-text-light">
                      {b.duration_minutes} min · {b.session_mode} · {formatUsd(b.amount_cents - b.platform_fee_cents)} to you
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
