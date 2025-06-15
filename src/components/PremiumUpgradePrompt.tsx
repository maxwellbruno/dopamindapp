
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PricingModal from './PricingModal';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumUpgradePromptProps {
  feature: string;
  description: string;
  tier: 'pro' | 'elite';
  className?: string;
}

const PremiumUpgradePrompt: React.FC<PremiumUpgradePromptProps> = ({ 
  feature, 
  description, 
  tier,
  className = ""
}) => {
  const [showPricing, setShowPricing] = useState(false);
  const { createSubscription, isCreatingSubscription } = useSubscription();

  const handleUpgrade = async (selectedTier: 'pro' | 'elite') => {
    try {
      const result = await createSubscription({ planId: selectedTier });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
    setShowPricing(false);
  };

  return (
    <>
      <div className={`dopamind-card p-6 text-center ${className}`}>
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">{tier === 'elite' ? '👑' : '🧠'}</span>
          </div>
          <h3 className="text-lg font-bold text-deep-blue mb-2">{feature}</h3>
          <p className="text-text-light text-sm mb-4">{description}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => setShowPricing(true)}
            disabled={isCreatingSubscription}
            className="w-full bg-mint-green hover:bg-mint-green/90 text-white font-semibold rounded-2xl h-12 shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {isCreatingSubscription ? 'Processing...' : 'Unlock Pro Features'}
          </Button>
          
          <p className="text-xs text-text-light">
            7-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentTier="free"
      />
    </>
  );
};

export default PremiumUpgradePrompt;
