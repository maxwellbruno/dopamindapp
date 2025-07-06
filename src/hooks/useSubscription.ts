
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionData {
  plan_id: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

interface CreateSubscriptionResponse {
  checkout_url: string;
  reference: string;
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

  const createSubscriptionMutation = useMutation<CreateSubscriptionResponse, Error, { planId: string }>({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      console.log('Creating subscription for plan:', planId, 'User email:', user.email);

      // Get the current session to ensure we have a valid token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }

      console.log('Invoking edge function with session:', !!session);

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          email: user.email,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Supabase function response:', { data, error });
      console.log('Function response status:', error?.status || 'success');

      if (error) {
        console.error('Supabase function error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to create subscription');
      }

      if (!data?.checkout_url) {
        throw new Error('Invalid response from subscription service');
      }

      return data as CreateSubscriptionResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => {
      console.error('Subscription creation error:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800",
      });
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
      toast({
        title: "Subscription Updated",
        description: "Your subscription will be cancelled at the end of the current period.",
        className: "bg-gradient-to-r from-mint-green/10 to-mint-green/20 border-mint-green/30 text-deep-blue",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800",
      });
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
    createSubscription: createSubscriptionMutation.mutateAsync,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
}
