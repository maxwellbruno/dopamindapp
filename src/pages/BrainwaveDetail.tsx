
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Download } from "lucide-react";

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

const BRAINWAVE_TRACKS: Record<string, { name: string; url: string }[]> = {
  alpha: [
    { name: "Alpha Focus 10Hz", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
    { name: "Alpha Relaxation 8Hz", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
    { name: "Alpha Meditation 12Hz", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
    { name: "Alpha Flow State 14Hz", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  ],
  theta: [
    { name: "Theta Deep Meditation 6Hz", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3" },
    { name: "Theta Creative Flow 4Hz", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3" },
    { name: "Theta Introspection 7Hz", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3" },
    { name: "Theta REM Sleep 5Hz", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3" },
  ],
  delta: [
    { name: "Delta Deep Sleep 2Hz", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3" },
    { name: "Delta Healing 1Hz", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3" },
    { name: "Delta Restoration 3Hz", url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3" },
    { name: "Delta Recovery 4Hz", url: "https://cdn.pixabay.com/audio/2022/10/16/audio_1212628ef1.mp3" },
  ]
};

const BRAINWAVE_NAMES: Record<string, { title: string; frequency: string; description: string }> = {
  alpha: {
    title: "Alpha Brainwaves",
    frequency: "8-14 Hz",
    description: "Ideal for gentle meditation, relaxed alertness, and stress reduction."
  },
  theta: {
    title: "Theta Brainwaves", 
    frequency: "4-8 Hz",
    description: "For creative flow, introspection, and meditative states."
  },
  delta: {
    title: "Delta Brainwaves",
    frequency: "1-4 Hz", 
    description: "Support for deep sleep, cellular restoration, and healing."
  }
};

const BrainwaveDetail: React.FC = () => {
  const { type } = useParams<{ type: string }>();
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
            Only Dopamind Elite subscribers can access Brainwaves.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (!type || !BRAINWAVE_NAMES[type]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="dopamind-card p-6 text-center max-w-sm w-full">
          <div className="text-sm md:text-base">Brainwave type not found.</div>
          <Button className="mt-4 w-full sm:w-auto" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const brainwaveInfo = BRAINWAVE_NAMES[type];
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
          <h2 className="text-xl md:text-2xl font-bold mb-2">{brainwaveInfo.title}</h2>
          <div className="text-base md:text-lg text-mint-green font-semibold">{brainwaveInfo.frequency}</div>
          <p className="text-text-light text-xs md:text-sm mt-2">{brainwaveInfo.description}</p>
        </div>
        <div className="space-y-4 md:space-y-5">
          {(BRAINWAVE_TRACKS[type] || []).map((track) => (
            <div key={track.name} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 py-3 md:py-2 last:border-b-0 gap-3 sm:gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-lg font-semibold text-deep-blue break-words">{track.name}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-center">
                <audio 
                  controls 
                  className="w-full sm:w-32 md:w-36 h-8 md:h-10" 
                  src={track.url}
                  preload="none"
                />
                {isElite && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="Download" 
                    onClick={() => handleDownload(track.url, track.name)}
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
            Upgrade to Elite to download brainwave tracks!
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainwaveDetail;
