
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

const GUIDED_MEDITATIONS = [
  { name: "Deep Relaxation - Body Scan Meditation", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
  { name: "Mindful Breathing - 10 Minute Focus", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
  { name: "Stress Relief - Progressive Muscle Relaxation", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
  { name: "Sleep Meditation - Evening Wind Down", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  { name: "Morning Motivation - Positive Affirmations", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3" },
  { name: "Anxiety Relief - Calming the Mind", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3" },
  { name: "Self-Love Meditation - Inner Compassion", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3" },
  { name: "Focus Enhancement - Mental Clarity", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3" },
  { name: "Gratitude Practice - Heart Opening", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3" },
  { name: "Energy Boost - Midday Revitalization", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3" },
];

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
        <div className="dopamind-card p-6 md:p-8 text-center max-w-sm md:max-w-md w-full">
          <div className="text-4xl mb-6">👑</div>
          <h1 className="text-lg md:text-xl font-bold text-deep-blue mb-2">Elite Exclusive</h1>
          <p className="text-text-light mb-4 text-sm md:text-base">
            Only Dopamind Elite subscribers can access Guided Meditations.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Back
          </Button>
        </div>
      </div>
    );
  }

  const isElite = subscription.isElite;

  // Download track for offline
  function handleDownload(url: string, name: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center px-4 py-6 md:py-10 relative">
      <Button variant="ghost" className="absolute left-2 md:left-4 top-2 md:top-4 text-sm md:text-base" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="dopamind-card w-full max-w-sm md:max-w-lg lg:max-w-2xl p-6 md:p-8 animate-fade-in-up flex flex-col gap-4 md:gap-5 mt-12 md:mt-0">
        <div className="text-center mb-4">
          <div className="text-2xl md:text-3xl mb-2">🧘‍♀️</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Guided Meditations</h2>
          <p className="text-text-light text-xs md:text-sm mt-2">Transform your mind with expert-guided meditation sessions</p>
        </div>
        <div className="space-y-4 md:space-y-5">
          {GUIDED_MEDITATIONS.map((meditation) => (
            <div key={meditation.name} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 py-3 md:py-2 last:border-b-0 gap-3 sm:gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-lg font-semibold text-deep-blue break-words">{meditation.name}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-center">
                <audio 
                  controls 
                  className="w-full sm:w-32 md:w-36 h-8 md:h-10" 
                  src={meditation.url}
                  preload="none"
                />
                {isElite && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="Download" 
                    onClick={() => handleDownload(meditation.url, meditation.name)}
                    className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 self-center"
                  >
                    <Download size={16} className="md:w-5 md:h-5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {!isElite && (
          <div className="mt-4 md:mt-5 text-xs md:text-sm text-red-500 text-center">
            Upgrade to Elite to download meditation tracks!
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedMeditation;
