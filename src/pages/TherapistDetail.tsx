import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Star, MapPin, Calendar, Languages, BadgeCheck, Video, Phone,
  MessageSquare, Building2, Heart, Gauge, Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TherapistRow } from '@/hooks/useTherapistProfile';
import { formatUsd } from '@/lib/escrow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const sessionTypeIcons: Record<string, React.ReactNode> = {
  Video: <Video className="w-4 h-4" />,
  'In-Person': <Building2 className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Chat: <MessageSquare className="w-4 h-4" />,
};

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const { data: therapist, isLoading } = useQuery({
    queryKey: ['therapist', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('therapists').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return (data as TherapistRow) ?? null;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['therapist-reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapist_reviews')
        .select('*')
        .eq('therapist_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: myLike } = useQuery({
    queryKey: ['therapist-like', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('therapist_likes')
        .select('id')
        .eq('therapist_id', id!)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  const toggleLike = async () => {
    if (!user) return toast.error('Please sign in first.');
    if (myLike) {
      await supabase.from('therapist_likes').delete().eq('id', myLike.id);
    } else {
      const { error } = await supabase.from('therapist_likes').insert({ therapist_id: id!, user_id: user.id });
      if (error) return toast.error('Could not save your like.');
    }
    queryClient.invalidateQueries({ queryKey: ['therapist-like', id, user.id] });
    queryClient.invalidateQueries({ queryKey: ['therapist', id] });
  };

  const submitReport = async () => {
    if (!user) return toast.error('Please sign in first.');
    if (reportReason.trim().length < 3) return toast.error('Please give a reason.');
    const { error } = await supabase.from('therapist_reports').insert({
      therapist_id: id!,
      reporter_user_id: user.id,
      reason: reportReason.trim(),
      details: reportDetails.trim() || null,
    });
    if (error) return toast.error('Could not submit the report.');
    setReportOpen(false);
    setReportReason('');
    setReportDetails('');
    toast.success('Report submitted', { description: 'Our team will review this profile.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-text-light text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center max-w-sm w-full">
          <p className="text-text-dark font-medium mb-2">Therapist not found</p>
          <button onClick={() => navigate('/therapists')} className="bg-mint-green text-white font-semibold rounded-2xl px-6 py-2">
            Browse therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          <div className="flex items-center mb-6 animate-fade-in-up">
            <button
              onClick={() => navigate('/therapists')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Therapist Profile</h1>
          </div>

          <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-light-gray to-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {therapist.avatar_url ? (
                  <img src={therapist.avatar_url} alt={`${therapist.full_name}, ${therapist.title}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-text-dark">{therapist.full_name}</h2>
                  <BadgeCheck className="w-5 h-5 text-mint-green" aria-label="Verified therapist" />
                </div>
                <p className="text-base font-semibold text-mint-green mb-1">{therapist.title}</p>
                <p className="text-sm text-text-light mb-2">{therapist.credentials}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-light">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold text-text-dark">{therapist.rating_avg?.toFixed(1)}</span>
                    <span className="ml-1">({therapist.rating_count} reviews)</span>
                  </span>
                  <span className="flex items-center">
                    <Gauge className="w-4 h-4 mr-1" />
                    Score {Math.round(therapist.score)}/100
                  </span>
                  {therapist.location && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {therapist.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-gray rounded-2xl p-4">
                <div className="flex items-center text-text-light text-sm mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Experience
                </div>
                <p className="text-lg font-bold text-text-dark">{therapist.years_of_experience} years</p>
              </div>
              <div className="bg-light-gray rounded-2xl p-4">
                <div className="flex items-center text-text-light text-sm mb-1">
                  <Languages className="w-4 h-4 mr-2" />
                  Languages
                </div>
                <p className="text-lg font-bold text-text-dark">{therapist.languages || '—'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">About</h3>
              <p className="text-text-light leading-relaxed">{therapist.bio}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {(therapist.specialties ?? []).map((specialty) => (
                  <span key={specialty} className="text-sm font-medium text-deep-blue bg-deep-blue/10 rounded-full px-3 py-1">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">Session types</h3>
              <div className="flex flex-wrap gap-2">
                {(therapist.session_types ?? []).map((type) => (
                  <span key={type} className="inline-flex items-center text-sm font-medium text-text-dark bg-light-gray rounded-full px-3 py-1.5">
                    <span className="mr-1.5">{sessionTypeIcons[type]}</span>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-light-gray rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Availability</p>
                  <p className="text-lg font-bold text-text-dark">
                    {therapist.is_accepting_clients ? 'Accepting clients' : 'Fully booked'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-light">Rate</p>
                  <p className="text-lg font-bold text-text-dark">{formatUsd(therapist.rate_cents_per_30min)} / 30 min</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/therapists/${therapist.id}/book`)}
              disabled={!therapist.is_accepting_clients}
              className="w-full bg-mint-green text-white font-semibold rounded-2xl py-4 hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
              Book & pay with crypto
            </button>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={toggleLike}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold border-2 transition-colors ${
                  myLike ? 'border-mint-green bg-mint-green/10 text-mint-green' : 'border-gray-200 text-text-dark hover:border-mint-green'
                }`}
              >
                <Heart className={`w-4 h-4 ${myLike ? 'fill-current' : ''}`} />
                {therapist.likes_count} likes
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-semibold border-2 border-gray-200 text-text-light hover:border-red-300 hover:text-red-500 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>

          {/* Reviews */}
          <div className="dopamind-card p-6 mt-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-base font-bold text-text-dark mb-4">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-text-light">No reviews yet. Reviews can be left after a completed session.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-xs text-text-light ml-2">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.review && <p className="text-sm text-text-light">{r.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-text-light leading-relaxed">
              <strong className="text-text-dark">Important:</strong> Dopamind is a wellness tool and does not provide therapy or medical treatment. This therapist is an independent professional. Payments are held in escrow and released to the therapist after your session ends, minus a 15% Dopamind fee.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Reason (e.g. misleading credentials)" value={reportReason} onChange={(e) => setReportReason(e.target.value)} maxLength={120} />
            <Textarea placeholder="Additional details (optional)" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} maxLength={1000} />
            <button onClick={submitReport} className="w-full bg-red-500 text-white font-semibold rounded-2xl py-3">
              Submit report
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistDetail;
