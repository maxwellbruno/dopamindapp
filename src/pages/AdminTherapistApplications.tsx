import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const DOC_FIELDS: { key: string; label: string }[] = [
  { key: 'profile_picture_path', label: 'Profile picture' },
  { key: 'license_document_path', label: 'Practice license' },
  { key: 'government_id_path', label: 'Government ID' },
  { key: 'additional_document_path', label: 'Certifications' },
];

const AdminTherapistApplications: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

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
    enabled: isAdmin,
  });

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
      await supabase.from('therapist_applications').update({ status: 'approved' }).eq('id', app.id);
      toast.success(`${app.full_name} is now listed.`);
      queryClient.invalidateQueries({ queryKey: ['admin-therapist-applications'] });
    } catch (e) {
      console.error(e);
      toast.error('Could not approve this application.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (app: any) => {
    setBusyId(app.id);
    const { error } = await supabase.from('therapist_applications').update({ status: 'rejected' }).eq('id', app.id);
    setBusyId(null);
    if (error) return toast.error('Could not reject this application.');
    queryClient.invalidateQueries({ queryKey: ['admin-therapist-applications'] });
  };

  if (adminLoading) {
    return <div className="min-h-screen bg-light-gray flex items-center justify-center text-sm text-text-light">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center max-w-sm">
          <ShieldAlert className="w-8 h-8 text-cool-gray mx-auto mb-3" />
          <p className="text-text-dark font-medium mb-1">Admins only</p>
          <p className="text-text-light text-sm">You do not have access to therapist application reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Therapist applications</h1>
          </div>

          {isLoading && <div className="dopamind-card p-8 text-center text-sm text-text-light">Loading applications...</div>}

          <div className="space-y-4">
            {applications.map((app: any) => (
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

                <p className="text-sm text-text-light mb-3 line-clamp-3">{app.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {DOC_FIELDS.filter((f) => app[f.key]).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => openDoc(app[f.key])}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-dark bg-light-gray rounded-full px-3 py-1.5 hover:bg-gray-100"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {f.label}
                    </button>
                  ))}
                </div>

                {app.status !== 'approved' && (
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
                      className="px-4 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-text-light hover:border-red-300 hover:text-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!isLoading && applications.length === 0 && (
              <div className="dopamind-card p-8 text-center text-sm text-text-light">No applications yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTherapistApplications;
