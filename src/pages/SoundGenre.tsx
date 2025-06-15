import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Download } from "lucide-react";
import { SOUND_TRACKS, SOUND_NAMES } from "@/constants/focusConstants";

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

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
