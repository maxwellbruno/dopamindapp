
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Pause } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  premium: boolean;
  hasGenrePage?: boolean;
  url?: string;
}

interface AmbientSoundsSidebarProps {
  availableSounds: Sound[];
  selectedSound: string | null;
  setSelectedSound: (id: string | null) => void;
  isPremium: boolean;
  soundOptions: Sound[];
}

const AmbientSoundsSidebar: React.FC<AmbientSoundsSidebarProps> = ({
  availableSounds,
  selectedSound,
  setSelectedSound,
  isPremium,
  soundOptions,
}) => {
  const navigate = useNavigate();

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId) {
      setSelectedSound(null);
    } else {
      setSelectedSound(soundId);
    }
  };

  return (
    <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.5s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Ambient Sounds</h3>
      <div className="space-y-3">
        {availableSounds.map((sound) => (
          <div key={sound.id} className="flex items-center justify-between group">
            <span className="text-text-dark">{sound.name}</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleSoundSelect(sound.id)} aria-label={`Play ${sound.name}`}>
                {selectedSound === sound.id ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              {sound.hasGenrePage && (
                <Button
                  variant="link"
                  onClick={() => navigate(`/sound/${sound.id}`)}
                  aria-label={`Explore ${sound.name}`}
                  className="ml-2 h-auto p-0 text-xs font-semibold text-mint-green hover:no-underline hover:scale-105 transition-transform"
                >
                  Explore
                </Button>
              )}
            </div>
          </div>
        ))}
        {!isPremium && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-text-light mb-2">Premium sounds available with Pro</p>
            <div className="space-y-2">
              {soundOptions.filter(s => s.premium).slice(0, 2).map((sound) => (
                <div key={sound.id} className="flex items-center justify-between opacity-50">
                  <span className="text-gray-400">{sound.name} 🔒</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbientSoundsSidebar;
