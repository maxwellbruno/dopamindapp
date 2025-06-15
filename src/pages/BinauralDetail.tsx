
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

const BINAURAL_TRACKS: Record<string, { name: string; url: string }[]> = {
  "396": [
    { name: "Liberating Calm 396Hz - Deep Release", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
    { name: "Fear Release 396Hz - Healing Tones", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
    { name: "Guilt Liberation 396Hz - Positive Energy", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
    { name: "Root Chakra 396Hz - Grounding", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  ],
  "417": [
    { name: "Positive Change 417Hz - Transformation", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3" },
    { name: "Negativity Clearing 417Hz - Renewal", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3" },
    { name: "Sacred Change 417Hz - Inner Shift", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3" },
    { name: "Life Transformation 417Hz - New Beginnings", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3" },
  ],
  "432": [
    { name: "Natural Harmony 432Hz - Earth Resonance", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3" },
    { name: "Cosmic Frequency 432Hz - Universal Peace", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3" },
    { name: "Nature Attunement 432Hz - Organic Flow", url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3" },
    { name: "Healing Frequency 432Hz - Cellular Repair", url: "https://cdn.pixabay.com/audio/2022/10/16/audio_1212628ef1.mp3" },
  ],
  "528": [
    { name: "DNA Healing 528Hz - Miracle Frequency", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
    { name: "Love Frequency 528Hz - Heart Opening", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
    { name: "Transformation 528Hz - Genetic Repair", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
    { name: "Solar Plexus 528Hz - Personal Power", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  ],
  "639": [
    { name: "Relationship Balance 639Hz - Heart Connection", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3" },
    { name: "Inner Harmony 639Hz - Emotional Balance", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3" },
    { name: "Love & Understanding 639Hz - Compassion", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3" },
    { name: "Social Connection 639Hz - Unity", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3" },
  ],
  "741": [
    { name: "Inner Awakening 741Hz - Intuition", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3" },
    { name: "Healthy Living 741Hz - Detoxification", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3" },
    { name: "Expression 741Hz - Throat Chakra", url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3" },
    { name: "Problem Solving 741Hz - Mental Clarity", url: "https://cdn.pixabay.com/audio/2022/10/16/audio_1212628ef1.mp3" },
  ],
  "852": [
    { name: "Spiritual Alignment 852Hz - Third Eye", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
    { name: "Return to Order 852Hz - Divine Connection", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
    { name: "Inner Strength 852Hz - Higher Self", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
    { name: "Spiritual Awakening 852Hz - Consciousness", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  ]
};

const BINAURAL_INFO: Record<string, { title: string; label: string; description: string; emoji: string }> = {
  "396": {
    title: "Binaural Beats – 396 Hz",
    label: "Liberating Calm",
    description: "Release guilt, fear, promote positivity.",
    emoji: "🌈"
  },
  "417": {
    title: "Binaural Beats – 417 Hz", 
    label: "Positive Change",
    description: "Facilitate change and undo negativity.",
    emoji: "🔄"
  },
  "432": {
    title: "Binaural Beats – 432 Hz",
    label: "Natural Harmony",
    description: "Relaxation, believed to be harmonious with nature.",
    emoji: "🌱"
  },
  "528": {
    title: "Binaural Beats – 528 Hz",
    label: "DNA Healing & Transformation",
    description: "Stress reduction, transformation, DNA repair.",
    emoji: "🧬"
  },
  "639": {
    title: "Binaural Beats – 639 Hz",
    label: "Relationship Balance",
    description: "Inner harmony, better relationships.",
    emoji: "💞"
  },
  "741": {
    title: "Binaural Beats – 741 Hz",
    label: "Inner Awakening",
    description: "Awaken intuition, encourage healthy living.",
    emoji: "✨"
  },
  "852": {
    title: "Binaural Beats – 852 Hz",
    label: "Spiritual Alignment",
    description: "Return to spiritual order.",
    emoji: "🕉️"
  }
};

const BinauralDetail: React.FC = () => {
  const { hz } = useParams<{ hz: string }>();
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
            Only Dopamind Elite subscribers can access Binaural Frequencies.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (!hz || !BINAURAL_INFO[hz]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="dopamind-card p-6 text-center max-w-sm w-full">
          <div className="text-sm md:text-base">Binaural frequency not found.</div>
          <Button className="mt-4 w-full sm:w-auto" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const binauralInfo = BINAURAL_INFO[hz];
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
          <div className="text-2xl md:text-3xl mb-2">{binauralInfo.emoji}</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">{binauralInfo.title}</h2>
          <div className="text-base md:text-lg text-warm-orange font-semibold">{binauralInfo.label}</div>
          <p className="text-text-light text-xs md:text-sm mt-2">{binauralInfo.description}</p>
        </div>
        <div className="space-y-4 md:space-y-5">
          {(BINAURAL_TRACKS[hz] || []).map((track) => (
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
            Upgrade to Elite to download binaural tracks!
          </div>
        )}
      </div>
    </div>
  );
};

export default BinauralDetail;
