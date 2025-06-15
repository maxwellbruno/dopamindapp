
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionManager: React.FC = () => {
  const { subscription, tier, cancelSubscription, isCancelling } = useSubscription();
  const navigate = useNavigate();

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast({
        title: "Subscription Updated",
        description: "Your subscription will be cancelled at the end of the current billing period.",
      });
      navigate('/profile');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!subscription || tier === 'free') {
    return (
      <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-dark mb-4">No Active Subscription</h1>
          <p className="text-text-light mb-6">You do not have an active subscription to manage.</p>
          <Link to="/profile">
            <Button className="bg-mint-green text-white hover:bg-mint-green/90">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Link to="/profile" className="mr-4">
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-text-dark">Manage Subscription</h1>
          </div>

          <div className="dopamind-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Your Plan</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-light">Current Plan</span>
                <span className="font-semibold text-text-dark capitalize">{tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-light">Status</span>
                <span className="font-semibold text-text-dark capitalize">{subscription.status}</span>
              </div>
              {subscription.current_period_end && (
                <div className="flex items-center justify-between">
                  <span className="text-text-light">Renews On</span>
                  <span className="text-text-light">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Your subscription will be cancelled at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!subscription.cancel_at_period_end && (
            <div className="dopamind-card p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Actions</h3>
              <Button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="w-full rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
              <p className="text-xs text-text-light mt-2 text-center">
                Your subscription will be cancelled at the end of the current billing period.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
