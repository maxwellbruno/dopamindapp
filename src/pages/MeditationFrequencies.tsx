
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

const MeditationFrequencies: React.FC = () => {
  const navigate = useNavigate();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  const isElite = subscription.isElite;

  if (!isElite) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="dopamind-card p-8 text-center">
          <div className="text-4xl mb-6">👑</div>
          <h1 className="text-xl font-bold text-deep-blue mb-2">Elite Exclusive</h1>
          <p className="text-text-light mb-4">
            Meditation Frequencies are available for Dopamind Elite subscribers only.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center py-10 px-4">
      <Button variant="ghost" className="absolute left-4 top-4" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="dopamind-card w-full max-w-md p-8 animate-fade-in-up space-y-8">
        <h2 className="text-2xl font-bold text-center mb-3">Meditation Frequencies</h2>
        <div className="flex flex-col gap-6">
          <div 
            className="rounded-2xl bg-gradient-to-r from-mint-green/90 to-mint-green/50 p-6 text-center cursor-pointer shadow-lg hover:scale-[1.03] transition"
            onClick={() => navigate("/meditation/brainwaves")}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center mb-2">
              <ArrowUp className="text-white bg-mint-green p-1 rounded-full mr-2" size={28} />
              <span className="text-lg font-semibold text-white">Brainwaves</span>
            </div>
            <p className="text-white text-sm">Alpha, Theta & Delta – for relaxation, meditation, and sleep</p>
          </div>

          <div 
            className="rounded-2xl bg-gradient-to-r from-warm-orange/80 to-mint-green/80 p-6 text-center cursor-pointer shadow-lg hover:scale-[1.03] transition"
            onClick={() => navigate("/meditation/binaural")}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center mb-2">
              <ArrowDown className="text-white bg-warm-orange p-1 rounded-full mr-2" size={28} />
              <span className="text-lg font-semibold text-white">Binaural Frequencies</span>
            </div>
            <p className="text-white text-sm">Explore healing and transformative Hz-based tones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationFrequencies;
