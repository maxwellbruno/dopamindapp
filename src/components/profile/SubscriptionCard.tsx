
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getTierLabel } from '../../lib/subscriptionUtils';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

const SubscriptionCard: React.FC = () => {
  const [showPricing, setShowPricing] = useState(false);
  const { 
    subscription, 
    tier, 
    createSubscription, 
    isCreatingSubscription,
    isLoading 
  } = useSubscription();

  const handleUpgrade = async (planId: 'pro' | 'elite') => {
    try {
      const result = await createSubscription({ planId });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-semibold text-text-dark mb-4">Subscription</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Subscription</h3>
      
      {tier === 'free' ? (
        <div className="text-center">
          <p className="text-text-light mb-4">Unlock premium features to enhance your wellness journey</p>
          <Dialog open={showPricing} onOpenChange={setShowPricing}>
            <DialogTrigger asChild>
              <Button className="w-full bg-mint-green hover:bg-mint-green/90 text-white font-semibold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
                Upgrade to Pro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-light-gray border-0 rounded-3xl max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-center text-deep-blue text-xl font-bold">Choose Your Plan</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-6">
                <div className="border-2 border-mint-green rounded-2xl p-6 relative bg-white">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-mint-green text-white px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                  <h4 className="text-lg font-bold text-mint-green mb-2">Dopamind Pro</h4>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold text-deep-blue">$9.99</span>
                    <span className="text-text-light ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-light mb-6">
                    <li>✓ Advanced mood analytics</li>
                    <li>✓ Custom focus sessions</li>
                    <li>✓ Progress tracking</li>
                    <li>✓ Breathing exercises</li>
                    <li>✓ Dopamind AI Chat Assistant</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('pro')}
                    disabled={isCreatingSubscription}
                    className="w-full bg-mint-green text-white font-semibold rounded-xl hover:bg-mint-green/90 disabled:opacity-50"
                  >
                    {isCreatingSubscription ? 'Processing...' : 'Start Free Trial'}
                  </Button>
                </div>

                <div className="border-2 border-deep-blue rounded-2xl p-6 bg-white">
                  <h4 className="text-lg font-bold text-mint-green mb-2">Dopamind Elite</h4>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold text-deep-blue">$19.99</span>
                    <span className="text-text-light ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-light mb-6">
                    <li>✓ Everything in Pro</li>
                    <li>✓ Personalized recommendations</li>
                    <li>✓ Advanced meditation guides</li>
                    <li>✓ Weekly wellness reports</li>
                    <li>✓ Premium content library</li>
                    <li>✓ AI Soundscape Generation</li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('elite')}
                    disabled={isCreatingSubscription}
                    className="w-full bg-mint-green text-white font-semibold rounded-xl hover:bg-mint-green/90 disabled:opacity-50"
                  >
                    {isCreatingSubscription ? 'Processing...' : 'Start Free Trial'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-light">Current Plan</span>
            <span className="font-semibold text-text-dark">{getTierLabel(tier)}</span>
          </div>
          {subscription?.current_period_end && (
            <div className="flex items-center justify-between">
              <span className="text-text-light">Renewal Date</span>
              <span className="text-text-light">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
            </div>
          )}
          
          {tier === 'pro' && (
            <Button 
              variant="outline" 
              className="w-full rounded-xl !bg-white !border-deep-blue !text-deep-blue hover:!bg-deep-blue hover:!text-white focus:!bg-deep-blue focus:!text-white active:!bg-deep-blue active:!text-white focus:ring-2 focus:ring-deep-blue"
              onClick={() => setShowPricing(true)}
            >
              Upgrade to Elite
            </Button>
          )}
          
          <Link to="/profile/subscription" className="block w-full">
            <Button 
              variant="outline" 
              className="w-full rounded-xl !bg-white !border-deep-blue !text-deep-blue hover:!bg-deep-blue hover:!text-white focus:!bg-deep-blue focus:!text-white active:!bg-deep-blue active:!text-white focus:ring-2 focus:ring-deep-blue"
            >
              Manage Subscription
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
