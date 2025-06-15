
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

const SOUND_TRACKS: Record<string, { name: string; url: string }[]> = {
  lofi: [
    { name: "Rainy Night", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3" },
    { name: "LoFi Chill", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3" },
    { name: "Evening Jazz", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3" },
    { name: "Rainy Lofi City", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3" },
  ],
  whitenoise: [
    { name: "Pure White Noise", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3" },
    { name: "Soft Static", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3" },
  ],
  ocean: [
    { name: "Waves on Shore", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3" },
    { name: "Calm Ocean", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3" },
  ],
  forest: [
    { name: "Morning Birds", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3" },
    { name: "Forest Ambience", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3" },
  ],
  cafe: [
    { name: "Cafe Background", url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3" },
    { name: "Faint Music in Cafe", url: "https://cdn.pixabay.com/audio/2022/10/16/audio_1212628ef1.mp3" },
  ],
  rain: [
    { name: "Gentle Rain", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1e3121.mp3" },
    { name: "Rain on Window", url: "https://cdn.pixabay.com/audio/2023/07/17/audio_1282f3da13.mp3" },
  ]
};

const SOUND_NAMES: Record<string, string> = {
  lofi: "LoFi Music",
  whitenoise: "White Noise",
  ocean: "Ocean Waves",
  forest: "Forest Sounds",
  cafe: "Café Ambience",
  rain: "Gentle Rain",
};

const SoundGenre: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });

  if (!id || !SOUND_NAMES[id]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="dopamind-card p-6">
          <div>Sound not found.</div>
          <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const pro = subscription.isPro || subscription.isElite;

  // Download track for offline
  function handleDownload(url: string, name: string) {
    // To allow browser download:
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center px-4 py-10 relative">
      <Button variant="ghost" className="absolute left-4 top-4" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="dopamind-card w-full max-w-lg p-8 animate-fade-in-up flex flex-col gap-5">
        <h2 className="text-2xl font-bold mb-2 text-center">{SOUND_NAMES[id]}</h2>
        <div className="space-y-5">
          {(SOUND_TRACKS[id] || []).map((track) => (
            <div key={track.name} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0">
              <div>
                <div className="text-lg font-semibold">{track.name}</div>
              </div>
              <div className="flex gap-2">
                <audio controls className="w-36" src={track.url} />
                {pro && (
                  <Button size="icon" variant="ghost" title="Download" onClick={() => handleDownload(track.url, track.name)}>
                    <Download size={18} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {!pro && (
          <div className="mt-5 text-sm text-red-500 text-center">
            Upgrade to Pro to download and explore more tracks!
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundGenre;

