
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Lock } from 'lucide-react';
import PricingModal from '../PricingModal';
import { useSubscription } from '@/hooks/useSubscription';

interface AISoundscapeCardProps {
  isElite: boolean;
  isPremium: boolean;
}

const AISoundscapeCard: React.FC<AISoundscapeCardProps> = ({ isElite, isPremium }) => {
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const { createSubscription, isCreatingSubscription } = useSubscription();

  const handleNavigate = () => {
    if (!isElite) {
      setShowPricing(true);
      return;
    }
    navigate('/ai-soundscape');
  };

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
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-deep-blue mb-1 flex items-center gap-2">
                  AI Soundscape
                  {!isElite && <Lock className="w-4 h-4 text-mint-green" />}
                </h3>
                <p className="text-sm text-text-light">Generate personalized mindfulness audio with AI</p>
              </div>
            </div>
            <Button 
              onClick={handleNavigate}
              disabled={isCreatingSubscription}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="text-white">
                {!isElite ? 'Upgrade' : 'Explore'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentTier={isPremium ? 'pro' : 'free'}
      />
    </>
  );
};

export default AISoundscapeCard;
