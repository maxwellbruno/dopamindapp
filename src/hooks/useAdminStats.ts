import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from './useIsAdmin';

export type AdminStats = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalTherapists: number;
  listedTherapists: number;
  unlistedTherapists: number;
  completedSessions: number;
  platformFeesCents: number;
  openReports: number;
};

const PENDING_STATUSES = ['draft', 'submitted', 'kyc_pending', 'kyc_passed', 'kyc_failed', 'pending_review'];

export function useAdminStats() {
  const { isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['admin-stats'],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminStats> => {
      const [apps, therapists, bookings, reports] = await Promise.all([
        supabase.from('therapist_applications').select('status'),
        supabase.from('therapists').select('is_published'),
        supabase.from('therapist_bookings').select('status, platform_fee_cents'),
        supabase.from('therapist_reports').select('status'),
      ]);

      const appRows = apps.data ?? [];
      const therapistRows = therapists.data ?? [];
      const bookingRows = bookings.data ?? [];
      const reportRows = reports.data ?? [];

      const completed = bookingRows.filter((b: any) => b.status === 'completed');

      return {
        totalApplications: appRows.length,
        pendingApplications: appRows.filter((a: any) => PENDING_STATUSES.includes(a.status)).length,
        approvedApplications: appRows.filter((a: any) => a.status === 'approved').length,
        rejectedApplications: appRows.filter((a: any) => a.status === 'rejected').length,
        totalTherapists: therapistRows.length,
        listedTherapists: therapistRows.filter((t: any) => t.is_published).length,
        unlistedTherapists: therapistRows.filter((t: any) => !t.is_published).length,
        completedSessions: completed.length,
        platformFeesCents: completed.reduce((sum: number, b: any) => sum + (b.platform_fee_cents ?? 0), 0),
        openReports: reportRows.filter((r: any) => r.status === 'open').length,
      };
    },
  });
}
