import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TherapistRow = {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  credentials: string;
  bio: string;
  location: string;
  languages: string;
  specialties: string[];
  session_types: string[];
  years_of_experience: number;
  avatar_url: string | null;
  rate_cents_per_30min: number;
  payout_wallet_address: string | null;
  is_published: boolean;
  is_accepting_clients: boolean;
  score: number;
  rating_avg: number;
  rating_count: number;
  likes_count: number;
  completed_sessions: number;
};

/** The signed-in user's own therapist profile + application status (if any). */
export function useTherapistProfile() {
  const { user } = useAuth();

  const profile = useQuery({
    queryKey: ['my-therapist-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Failed to load therapist profile', error);
        return null;
      }
      return (data as TherapistRow) ?? null;
    },
    enabled: !!user,
  });

  const application = useQuery({
    queryKey: ['my-therapist-application', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('therapist_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Failed to load therapist application', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  return {
    therapist: profile.data ?? null,
    application: application.data ?? null,
    isLoading: profile.isLoading || application.isLoading,
    refetch: async () => {
      await Promise.all([profile.refetch(), application.refetch()]);
    },
  };
}
