import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumUpgradePrompt from './PremiumUpgradePrompt';

interface RequireTierProps {
  tier: 'pro' | 'elite';
  feature: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Gates content behind a subscription tier.
 * - tier="pro"   → allowed when user is Pro OR Elite
 * - tier="elite" → allowed only when user is Elite
 */
const RequireTier: React.FC<RequireTierProps> = ({ tier, feature, description, children }) => {
  const { isPro, isElite, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-text-light text-sm">Loading...</div>
      </div>
    );
  }

  const allowed = tier === 'elite' ? isElite : (isPro || isElite);

  if (allowed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-10 pb-28">
        <div className="max-w-md mx-auto">
          <PremiumUpgradePrompt feature={feature} description={description} tier={tier} />
        </div>
      </div>
    </div>
  );
};

export default RequireTier;
