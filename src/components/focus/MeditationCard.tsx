
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Mic, Play, Pause, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PricingModal from '../PricingModal';
import { useSubscription } from '@/hooks/useSubscription';

interface MeditationCardProps {
  selectedSound: string | null;
  setSelectedSound: (id: string | null) => void;
  isPremium: boolean;
}

const MeditationCard: React.FC<MeditationCardProps> = ({ selectedSound, setSelectedSound, isPremium }) => {
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const { createSubscription, isCreatingSubscription } = useSubscription();

  const handlePlayToggle = (soundId: string) => {
    if (!isPremium) {
      setShowPricing(true);
      return;
    }
    
    if (selectedSound === soundId) {
      setSelectedSound(null);
    } else {
      setSelectedSound(soundId);
    }
  };

  const handleNavigate = (path: string) => {
    if (!isPremium) {
      setShowPricing(true);
      return;
    }
    navigate(path);
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
      <Card className="dopamind-card animate-fade-in-up">
        <CardHeader className="p-4">
          <CardTitle className="text-center text-lg font-bold text-deep-blue flex items-center justify-center gap-2">
            Meditation
            {!isPremium && <Lock className="w-4 h-4 text-mint-green" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-mint-green/90 to-mint-green/50 p-4 text-left shadow-md hover:scale-[1.03] transition flex items-center justify-between gap-4">
            <div
              className="flex items-center gap-4 cursor-pointer flex-grow"
              onClick={() => handleNavigate("/meditation/brainwaves")}
              role="button"
              tabIndex={0}
            >
              <div className="bg-mint-green p-2 rounded-full">
                <ArrowUp className="text-white" size={20} />
              </div>
              <div>
                <span className="text-md font-semibold text-white">Brainwaves</span>
                <p className="text-white/90 text-xs">Alpha, Theta & Delta for relaxation</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 hover:text-white flex-shrink-0" 
              onClick={() => handlePlayToggle('brainwaves_theta')}
            >
              {!isPremium ? <Lock size={20} /> : (selectedSound === 'brainwaves_theta' ? <Pause size={20} /> : <Play size={20} />)}
            </Button>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-deep-blue/80 to-mint-green/80 p-4 text-left shadow-md hover:scale-[1.03] transition flex items-center justify-between gap-4">
             <div
              className="flex items-center gap-4 cursor-pointer flex-grow"
              onClick={() => handleNavigate("/meditation/binaural")}
              role="button"
              tabIndex={0}
            >
              <div className="bg-deep-blue p-2 rounded-full">
                <ArrowDown className="text-white" size={20} />
              </div>
              <div>
                <span className="text-md font-semibold text-white">Binaural Frequencies</span>
                <p className="text-white/90 text-xs">Transformative Hz-based tones</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 hover:text-white flex-shrink-0" 
              onClick={() => handlePlayToggle('binaural_432hz')}
            >
              {!isPremium ? <Lock size={20} /> : (selectedSound === 'binaural_432hz' ? <Pause size={20} /> : <Play size={20} />)}
            </Button>
          </div>

          <div
            className="rounded-xl bg-gradient-to-r from-blue-400/80 to-purple-400/80 p-4 text-left cursor-pointer shadow-md hover:scale-[1.03] transition flex items-center justify-between gap-4"
            onClick={() => handleNavigate("/meditation/guided")}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-4 flex-grow">
              <div className="bg-blue-500 p-2 rounded-full">
                <Mic className="text-white" size={20} />
              </div>
              <div>
                <span className="text-md font-semibold text-white">Guided Meditation</span>
                <p className="text-white/90 text-xs">Follow along with guided sessions</p>
              </div>
            </div>
            {!isPremium && <Lock className="w-5 h-5 text-white" />}
          </div>
        </CardContent>
      </Card>

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentTier="free"
      />
    </>
  );
};

export default MeditationCard;
