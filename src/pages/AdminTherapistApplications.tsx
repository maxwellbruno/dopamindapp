import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminGuard from '@/components/admin/AdminGuard';

const DOC_FIELDS: { key: string; label: string }[] = [
  { key: 'profile_picture_path', label: 'Profile picture' },
  { key: 'license_document_path', label: 'Practice license' },
  { key: 'government_id_path', label: 'Government ID' },
  { key: 'additional_document_path', label: 'Certifications' },
  { key: 'kyc_selfie_path', label: 'KYC selfie' },
];

const TABS = ['pending', 'approved', 'rejected', 'all'] as const;
type Tab = (typeof TABS)[number];

const PENDING_STATUSES = ['draft', 'submitted', 'kyc_pending', 'kyc_passed', 'kyc_failed', 'pending_review'];

const AdminTherapistApplicationsInner: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-therapist-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapist_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const counts = useMemo(
    () => ({
      pending: applications.filter((a: any) => PENDING_STATUSES.includes(a.status)).length,
      approved: applications.filter((a: any) => a.status === 'approved').length,
      rejected: applications.filter((a: any) => a.status === 'rejected').length,
      all: applications.length,
    }),
    [applications]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a: any) => {
      const matchesTab =
        tab === 'all' ||
        (tab === 'pending' && PENDING_STATUSES.includes(a.status)) ||
        (tab === 'approved' && a.status === 'approved') ||
        (tab === 'rejected' && a.status === 'rejected');
      const matchesSearch =
        !q || String(a.full_name).toLowerCase().includes(q) || String(a.email).toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [applications, tab, search]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-therapist-applications'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
  };

  const openDoc = async (path?: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('therapist-documents').createSignedUrl(path, 600);
    if (error || !data) return toast.error('Could not open the document.');
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const approve = async (app: any) => {
    setBusyId(app.id);
    try {
      const { data: existing } = await supabase.from('therapists').select('id').eq('user_id', app.user_id).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from('therapists').insert({
          user_id: app.user_id,
          application_id: app.id,
          full_name: app.full_name,
          title: app.title,
          credentials: app.credentials,
          bio: app.bio,
          location: app.location,
          languages: app.languages,
          specialties: app.specialties ?? [],
          session_types: app.session_types ?? [],
          years_of_experience: app.years_of_experience ?? 0,
          is_published: true,
          is_accepting_clients: true,
        });
        if (error) throw error;
      } else {
        await supabase.from('therapists').update({ is_published: true }).eq('id', existing.id);
      }
      await supabase
        .from('therapist_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), review_notes: notes[app.id] ?? null })
        .eq('id', app.id);
      toast.success(`${app.full_name} is now listed.`);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error('Could not approve this application.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (app: any) => {
    setBusyId(app.id);
    const { error } = await supabase
      .from('therapist_applications')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), review_notes: notes[app.id] ?? null })
      .eq('id', app.id);
    setBusyId(null);
    if (error) return toast.error('Could not reject this application.');
    toast.success('Application rejected.');
    refresh();
  };

  const reopen = async (app: any) => {
    setBusyId(app.id);
    const { error } = await supabase
      .from('therapist_applications')
      .update({ status: 'pending_review' })
      .eq('id', app.id);
    setBusyId(null);
    if (error) return toast.error('Could not reopen this application.');
    refresh();
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
            <h1 className="text-2xl font-bold text-text-dark">Therapist applications</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'bg-mint-green text-white'
                    : 'bg-white dark:bg-card text-text-light border-2 border-gray-100 dark:border-border'
                }`}
              >
                {t} ({counts[t]})
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <Search className="w-4 h-4 text-text-light absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-card text-text-dark placeholder:text-text-light border-2 border-gray-100 dark:border-border focus:outline-none focus:border-mint-green text-sm"
            />
          </div>

          {isLoading && <div className="dopamind-card p-8 text-center text-sm text-text-light">Loading applications...</div>}

          <div className="space-y-4">
            {visible.map((app: any) => (
              <div key={app.id} className="dopamind-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-text-dark">{app.full_name}</p>
                    <p className="text-sm text-mint-green font-semibold">{app.title}</p>
                    <p className="text-xs text-text-light">{app.email} · {app.location}</p>
                  </div>
                  <span className="text-xs font-semibold text-deep-blue bg-deep-blue/10 rounded-full px-2.5 py-1 capitalize">
                    {String(app.status).replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-text-light mb-2">
                  License {app.license_number} ({app.license_state}) · {app.years_of_experience} yrs · {app.credentials}
                </p>
                <p className="text-xs font-semibold mb-3">
                  KYC:{' '}
                  <span className={app.persona_status === 'approved' || app.kyc_status === 'passed' ? 'text-mint-green' : 'text-orange-500'}>
                    {app.persona_status ?? app.kyc_status ?? 'pending'}
                  </span>
                </p>

                <p className="text-sm text-text-light mb-3 whitespace-pre-line">{app.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {DOC_FIELDS.filter((f) => app[f.key]).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => openDoc(app[f.key])}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-dark bg-light-gray dark:bg-muted rounded-full px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-muted/70"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {f.label}
                    </button>
                  ))}
                </div>

                {app.review_notes && (
                  <p className="text-xs text-text-light mb-3">
                    <span className="font-semibold text-text-dark">Review note:</span> {app.review_notes}
                  </p>
                )}

                {app.status !== 'approved' && app.status !== 'rejected' && (
                  <>
                    <textarea
                      value={notes[app.id] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [app.id]: e.target.value }))}
                      placeholder="Optional review note"
                      rows={2}
                      className="w-full mb-3 px-4 py-2.5 rounded-2xl bg-light-gray dark:bg-muted text-text-dark placeholder:text-text-light border-2 border-transparent dark:border-border focus:outline-none focus:border-mint-green text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(app)}
                        disabled={busyId === app.id}
                        className="flex-1 bg-mint-green text-white font-semibold rounded-2xl py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {busyId === app.id && <Loader2 className="w-4 h-4 animate-spin" />} Approve & list
                      </button>
                      <button
                        onClick={() => reject(app)}
                        disabled={busyId === app.id}
                        className="px-4 rounded-2xl border-2 border-gray-200 dark:border-border text-sm font-semibold text-text-light hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {app.status === 'rejected' && (
                  <button
                    onClick={() => reopen(app)}
                    disabled={busyId === app.id}
                    className="px-4 py-2 rounded-2xl border-2 border-gray-200 dark:border-border text-sm font-semibold text-text-dark hover:border-mint-green disabled:opacity-60"
                  >
                    Reopen for review
                  </button>
                )}
              </div>
            ))}
            {!isLoading && visible.length === 0 && (
              <div className="dopamind-card p-8 text-center text-sm text-text-light">No applications here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminTherapistApplications: React.FC = () => (
  <AdminGuard>
    <AdminTherapistApplicationsInner />
  </AdminGuard>
);

export default AdminTherapistApplications;
