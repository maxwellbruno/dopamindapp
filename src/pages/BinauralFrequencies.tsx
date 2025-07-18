
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: "free" | "pro" | "elite";
}

const HZ_BEATS = [
  { hz: "396", label: "Liberating Calm", desc: "Release guilt, fear, promote positivity.", emoji: "🌈" },
  { hz: "417", label: "Positive Change", desc: "Facilitate change and undo negativity.", emoji: "🔄" },
  { hz: "432", label: "Natural Harmony", desc: "Relaxation, believed to be harmonious with nature.", emoji: "🌱" },
  { hz: "528", label: "DNA Healing & Transformation", desc: "Stress reduction, transformation, DNA repair.", emoji: "🧬" },
  { hz: "639", label: "Relationship Balance", desc: "Inner harmony, better relationships.", emoji: "💞" },
  { hz: "741", label: "Inner Awakening", desc: "Awaken intuition, encourage healthy living.", emoji: "✨" },
  { hz: "852", label: "Spiritual Alignment", desc: "Return to spiritual order.", emoji: "🕉️" },
];

const BinauralFrequencies: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-light-gray py-6 md:py-10 px-4 flex flex-col items-center relative">
      <Button variant="ghost" className="absolute left-2 md:left-4 top-2 md:top-4 text-sm md:text-base" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="dopamind-card w-full max-w-sm md:max-w-md lg:max-w-lg p-6 md:p-8 animate-fade-in-up space-y-6 md:space-y-8 mt-12 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-3">Binaural Frequencies</h2>
        <div className="space-y-4 md:space-y-5">
          {HZ_BEATS.map((hz) => (
            <div
              key={hz.hz}
              className="rounded-xl md:rounded-2xl bg-white border border-warm-orange/30 p-4 md:p-6 flex flex-col items-center gap-2 shadow-md hover:scale-[1.02] md:hover:scale-[1.03] transition-transform cursor-pointer"
              onClick={() => navigate(`/binaural/${hz.hz}`)}
              role="button"
              tabIndex={0}
            >
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">{hz.emoji}</div>
              <div className="text-base md:text-lg font-semibold text-deep-blue text-center">Binaural Beats – {hz.hz} Hz</div>
              <div className="text-warm-orange font-bold text-sm md:text-base">{hz.label}</div>
              <div className="text-text-light text-xs md:text-sm text-center leading-relaxed">{hz.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinauralFrequencies;
