
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PricingModal from './PricingModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PremiumUpgradePromptProps {
  feature: string;
  description: string;
  tier: 'pro' | 'elite';
  className?: string;
}

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const PremiumUpgradePrompt: React.FC<PremiumUpgradePromptProps> = ({ 
  feature, 
  description, 
  tier,
  className = ""
}) => {
  const [showPricing, setShowPricing] = useState(false);
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });

  const handleUpgrade = (selectedTier: 'pro' | 'elite') => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    setSubscription({
      isPro: selectedTier === 'pro' || selectedTier === 'elite',
      isElite: selectedTier === 'elite',
      subscriptionEnd: endDate.toISOString(),
      tier: selectedTier
    });
    setShowPricing(false);
  };

  return (
    <>
      <div className={`glass-card rounded-3xl p-6 neuro-shadow text-center ${className}`}>
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-serenity-blue to-lavender-haze rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">{tier === 'elite' ? '👑' : '🧠'}</span>
          </div>
          <h3 className="text-lg font-bold text-midnight-slate mb-2">{feature}</h3>
          <p className="text-slate-600 text-sm mb-4">{description}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => setShowPricing(true)}
            className="w-full bg-gradient-to-r from-serenity-blue to-mindful-mint text-white font-semibold rounded-2xl h-12 neuro-shadow hover:scale-[1.02] transition-transform"
          >
            Unlock {tier === 'elite' ? 'Elite' : 'Pro'} Features
          </Button>
          
          <p className="text-xs text-slate-500">
            7-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentTier={subscription.tier}
      />
    </>
  );
};

export default PremiumUpgradePrompt;
