
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionData {
  plan_id: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc('get_user_subscription');
      
      if (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
      }

      return data?.[0] || null;
    },
    enabled: !!user,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!user?.email) throw new Error('User email not found');

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          email: user.email,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!subscription?.plan_id) throw new Error('No active subscription');

      // In a real implementation, you'd call Paystack API to cancel
      // For now, we'll just mark it as cancelled in our database
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const hasActiveSubscription = subscription?.status === 'active' && 
    (!subscription?.current_period_end || new Date(subscription.current_period_end) > new Date());

  const isPro = hasActiveSubscription && subscription?.plan_id === 'pro';
  const isElite = hasActiveSubscription && subscription?.plan_id === 'elite';
  const isPremium = isPro || isElite;

  const tier: 'free' | 'pro' | 'elite' = 
    isElite ? 'elite' : isPro ? 'pro' : 'free';

  return {
    subscription,
    isLoading,
    hasActiveSubscription,
    isPro,
    isElite,
    isPremium,
    tier,
    createSubscription: createSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
}
