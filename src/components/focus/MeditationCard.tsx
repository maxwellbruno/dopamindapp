
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Mic, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MeditationCardProps {
  selectedSound: string | null;
  setSelectedSound: (id: string | null) => void;
}

const MeditationCard: React.FC<MeditationCardProps> = ({ selectedSound, setSelectedSound }) => {
  const navigate = useNavigate();

  const handlePlayToggle = (soundId: string) => {
    if (selectedSound === soundId) {
      setSelectedSound(null);
    } else {
      setSelectedSound(soundId);
    }
  };

  return (
    <Card className="dopamind-card animate-fade-in-up">
      <CardHeader className="p-4">
        <CardTitle className="text-center text-lg font-bold text-deep-blue">Meditation</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="rounded-xl bg-gradient-to-r from-mint-green/90 to-mint-green/50 p-4 text-left shadow-md hover:scale-[1.03] transition flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-4 cursor-pointer flex-grow"
            onClick={() => navigate("/meditation/brainwaves")}
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
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white flex-shrink-0" onClick={() => handlePlayToggle('brainwaves_theta')}>
            {selectedSound === 'brainwaves_theta' ? <Pause size={20} /> : <Play size={20} />}
          </Button>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-deep-blue/80 to-mint-green/80 p-4 text-left shadow-md hover:scale-[1.03] transition flex items-center justify-between gap-4">
           <div
            className="flex items-center gap-4 cursor-pointer flex-grow"
            onClick={() => navigate("/meditation/binaural")}
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
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white flex-shrink-0" onClick={() => handlePlayToggle('binaural_432hz')}>
            {selectedSound === 'binaural_432hz' ? <Pause size={20} /> : <Play size={20} />}
          </Button>
        </div>

        <div
          className="rounded-xl bg-gradient-to-r from-blue-400/80 to-purple-400/80 p-4 text-left cursor-pointer shadow-md hover:scale-[1.03] transition flex items-center gap-4"
          onClick={() => navigate("/meditation/guided")}
          role="button"
          tabIndex={0}
        >
          <div className="bg-blue-500 p-2 rounded-full">
            <Mic className="text-white" size={20} />
          </div>
          <div>
            <span className="text-md font-semibold text-white">Guided Meditation</span>
            <p className="text-white/90 text-xs">Follow along with guided sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeditationCard;
