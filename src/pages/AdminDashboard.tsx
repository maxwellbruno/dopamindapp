import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ClipboardList, Users, AlertTriangle, CalendarCheck, Wallet } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';
import { useAdminStats } from '@/hooks/useAdminStats';

const StatTile: React.FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
  <div className="dopamind-card p-4">
    <p className="text-xs font-semibold text-text-light uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-text-dark mt-1">{value}</p>
    {hint && <p className="text-xs text-text-light mt-0.5">{hint}</p>}
  </div>
);

const AdminDashboardInner: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminStats();

  const fees = data ? `$${(data.platformFeesCents / 100).toFixed(2)}` : '—';

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="mr-3 p-2 rounded-2xl bg-white dark:bg-card border-2 border-gray-100 dark:border-border hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Admin dashboard</h1>
          </div>

          {isLoading ? (
            <div className="dopamind-card p-8 text-center text-sm text-text-light">Loading overview...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatTile label="Applications" value={data?.totalApplications ?? 0} />
              <StatTile label="Pending review" value={data?.pendingApplications ?? 0} />
              <StatTile label="Approved" value={data?.approvedApplications ?? 0} />
              <StatTile label="Rejected" value={data?.rejectedApplications ?? 0} />
              <StatTile label="Therapists" value={data?.totalTherapists ?? 0} hint={`${data?.listedTherapists ?? 0} listed`} />
              <StatTile label="Unlisted" value={data?.unlistedTherapists ?? 0} />
              <StatTile label="Sessions done" value={data?.completedSessions ?? 0} />
              <StatTile label="Platform fees" value={fees} />
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/therapist-applications')}
              className="w-full dopamind-card p-4 flex items-center justify-between hover:bg-soft-gray dark:hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-deep-blue/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-deep-blue" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-dark">Therapist applications</p>
                  <p className="text-sm text-text-light">Review KYC, approve or reject</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!!data?.pendingApplications && (
                  <span className="text-xs font-bold text-white bg-mint-green rounded-full px-2 py-0.5">
                    {data.pendingApplications}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-text-light" />
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/therapists')}
              className="w-full dopamind-card p-4 flex items-center justify-between hover:bg-soft-gray dark:hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint-green/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-mint-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-dark">Listed therapists</p>
                  <p className="text-sm text-text-light">Scores, visibility and reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!!data?.openReports && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-500/10 rounded-full px-2 py-0.5">
                    <AlertTriangle className="w-3 h-3" /> {data.openReports}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-text-light" />
              </div>
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs text-text-light">
            <span className="inline-flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" /> Completed sessions</span>
            <span className="inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> 15% platform fee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => (
  <AdminGuard>
    <AdminDashboardInner />
  </AdminGuard>
);

export default AdminDashboard;
