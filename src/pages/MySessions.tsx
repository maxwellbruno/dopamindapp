import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatUsd } from '@/lib/escrow';

const MySessions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['my-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('therapist_bookings')
        .select('*, therapists(full_name, title)')
        .order('scheduled_start', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">My therapy sessions</h1>
          </div>

          {isLoading && <div className="dopamind-card p-8 text-center text-text-light text-sm">Loading...</div>}

          {!isLoading && sessions.length === 0 && (
            <div className="dopamind-card p-8 text-center">
              <CalendarClock className="w-8 h-8 text-cool-gray mx-auto mb-3" />
              <p className="text-text-dark font-medium mb-1">No sessions yet</p>
              <p className="text-text-light text-sm mb-4">Book a session with a verified therapist to get started.</p>
              <button onClick={() => navigate('/therapists')} className="bg-mint-green text-white font-semibold rounded-2xl px-6 py-2.5">
                Find a therapist
              </button>
            </div>
          )}

          <div className="space-y-3">
            {sessions.map((s: any) => (
              <button
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="w-full text-left dopamind-card p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-text-dark">{s.therapists?.full_name ?? 'Therapy session'}</p>
                  <span className="text-xs font-semibold text-deep-blue bg-deep-blue/10 rounded-full px-2.5 py-1 capitalize">
                    {String(s.status).replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-text-light">
                  {new Date(s.scheduled_start).toLocaleString()} · {s.duration_minutes} min · {s.session_mode}
                </p>
                <p className="text-sm font-semibold text-text-dark mt-1">{formatUsd(s.amount_cents)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessions;
