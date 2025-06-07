
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For now, simulate subscription management
      // In a real app, this would call a Stripe Customer Portal API
      alert('Subscription management portal would open here. This feature requires Stripe integration.');
      
      // Simulate updating subscription status
      const updatedSubscription = {
        ...subscription,
        subscriptionEnd: subscription.subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Error managing subscription:', error);
      alert('There was an error accessing the subscription management portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading}
      className="w-full bg-mint-green hover:bg-mint-green/90 text-white font-semibold rounded-2xl h-12"
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
};

export default SubscriptionManager;
