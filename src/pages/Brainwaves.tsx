
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

const BRAINWAVE_DATA = [
  {
    name: "Alpha Brainwaves (8-14 Hz)",
    title: "Relaxed Focus",
    desc: "Ideal for gentle meditation, relaxed alertness, and stress reduction.",
    emoji: "🧘‍♂️",
  },
  {
    name: "Theta Brainwaves (4-8 Hz)",
    title: "Deep Meditation",
    desc: "For creative flow, introspection, and meditative states.",
    emoji: "🌊",
  },
  {
    name: "Delta Brainwaves (1-4 Hz)",
    title: "Restorative Sleep",
    desc: "Support for deep sleep, cellular restoration, and healing.",
    emoji: "💤",
  }
];

const Brainwaves: React.FC = () => {
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
            Only Dopamind Elite subscribers can access Brainwaves.
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
      <div className="dopamind-card w-full max-w-md p-8 animate-fade-in-up space-y-8">
        <h2 className="text-2xl font-bold text-center mb-3">Brainwaves</h2>
        <div className="space-y-5">
          {BRAINWAVE_DATA.map((wave) => (
            <div
              key={wave.name}
              className="rounded-2xl bg-white border border-mint-green/30 p-6 flex flex-col items-center gap-2 shadow-md"
            >
              <div className="text-3xl mb-2">{wave.emoji}</div>
              <div className="text-lg font-semibold text-deep-blue">{wave.name}</div>
              <div className="text-mint-green font-bold">{wave.title}</div>
              <div className="text-text-light text-sm text-center">{wave.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brainwaves;
