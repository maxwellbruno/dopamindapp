
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

const GuidedMeditation: React.FC = () => {
  const navigate = useNavigate();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });

  if (!subscription.isElite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center">
          <div className="text-4xl mb-6">👑</div>
          <h1 className="text-xl font-bold text-deep-blue mb-2">Elite Exclusive</h1>
          <p className="text-text-light mb-4">
            Only Dopamind Elite subscribers can access Guided Meditations.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray py-10 px-4 flex flex-col items-center relative">
      <Button variant="ghost" className="absolute left-4 top-4" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="dopamind-card w-full max-w-md p-8 animate-fade-in-up space-y-8 text-center">
        <Mic className="mx-auto text-mint-green" size={48} />
        <h2 className="text-2xl font-bold text-center mb-3">Guided Meditations</h2>
        <p className="text-text-light">
          This feature is coming soon! Get ready for a collection of guided meditation sessions to help you with stress, focus, sleep, and more.
        </p>
      </div>
    </div>
  );
};

export default GuidedMeditation;
