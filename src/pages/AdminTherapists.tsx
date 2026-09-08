import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, Loader2, Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminGuard from '@/components/admin/AdminGuard';

const AdminTherapistsInner: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openReportsFor, setOpenReportsFor] = useState<string | null>(null);

  const { data: therapists = [], isLoading } = useQuery({
    queryKey: ['admin-therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('score', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-therapist-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapist_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleListed = async (t: any) => {
    setBusyId(t.id);
    const { error } = await supabase.from('therapists').update({ is_published: !t.is_published }).eq('id', t.id);
    setBusyId(null);
    if (error) return toast.error('Could not update this profile.');
    toast.success(!t.is_published ? `${t.full_name} is now listed.` : `${t.full_name} is now unlisted.`);
    queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const setReportStatus = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    const { error } = await supabase.from('therapist_reports').update({ status }).eq('id', reportId);
    if (error) return toast.error('Could not update this report.');
    queryClient.invalidateQueries({ queryKey: ['admin-therapist-reports'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="mr-3 p-2 rounded-2xl bg-white dark:bg-card border-2 border-gray-100 dark:border-border hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Listed therapists</h1>
          </div>

          {isLoading && <div className="dopamind-card p-8 text-center text-sm text-text-light">Loading therapists...</div>}

          <div className="space-y-4">
            {therapists.map((t: any) => {
              const theirReports = reports.filter((r: any) => r.therapist_id === t.id);
              const openCount = theirReports.filter((r: any) => r.status === 'open').length;
              return (
                <div key={t.id} className="dopamind-card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-text-dark">{t.full_name}</p>
                      <p className="text-sm text-mint-green font-semibold">{t.title}</p>
                      <p className="text-xs text-text-light">{t.location} · ${(t.rate_cents_per_30min / 100).toFixed(0)} / 30 min</p>
                    </div>
                    <span
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                        t.is_published ? 'text-mint-green bg-mint-green/10' : 'text-text-light bg-muted'
                      }`}
                    >
                      {t.is_published ? 'Listed' : 'Unlisted'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-text-light mb-3">
                    <span className="font-semibold text-text-dark">Score {Number(t.score).toFixed(1)}/100</span>
                    <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {Number(t.rating_avg).toFixed(1)} ({t.rating_count})</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {t.likes_count}</span>
                    <span>{t.completed_sessions} done · {t.cancelled_sessions} cancelled</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleListed(t)}
                      disabled={busyId === t.id}
                      className="px-4 py-2 rounded-2xl text-sm font-semibold border-2 border-gray-200 dark:border-border text-text-dark hover:border-mint-green disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {busyId === t.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t.is_published ? 'Unlist profile' : 'List profile'}
                    </button>
                    {theirReports.length > 0 && (
                      <button
                        onClick={() => setOpenReportsFor(openReportsFor === t.id ? null : t.id)}
                        className="px-4 py-2 rounded-2xl text-sm font-semibold bg-red-500/10 text-red-600 inline-flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {theirReports.length} report{theirReports.length > 1 ? 's' : ''}{openCount ? ` (${openCount} open)` : ''}
                      </button>
                    )}
                  </div>

                  {openReportsFor === t.id && (
                    <div className="mt-4 space-y-2">
                      {theirReports.map((r: any) => (
                        <div key={r.id} className="rounded-2xl bg-light-gray dark:bg-muted p-3">
                          <p className="text-sm font-semibold text-text-dark capitalize">{r.reason}</p>
                          {r.details && <p className="text-xs text-text-light mt-0.5">{r.details}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-semibold text-text-light capitalize">{r.status}</span>
                            {r.status === 'open' && (
                              <>
                                <button
                                  onClick={() => setReportStatus(r.id, 'reviewed')}
                                  className="text-xs font-semibold text-deep-blue hover:underline"
                                >
                                  Mark reviewed
                                </button>
                                <button
                                  onClick={() => setReportStatus(r.id, 'dismissed')}
                                  className="text-xs font-semibold text-text-light hover:underline"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {!isLoading && therapists.length === 0 && (
              <div className="dopamind-card p-8 text-center text-sm text-text-light">No therapist profiles yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminTherapists: React.FC = () => (
  <AdminGuard>
    <AdminTherapistsInner />
  </AdminGuard>
);

export default AdminTherapists;
