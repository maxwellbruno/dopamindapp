import React from 'react';
import { Button } from '@/components/ui/button';

interface TrackSleepPromptProps {
  onTrackSleepClick: () => void;
}

const TrackSleepPrompt: React.FC<TrackSleepPromptProps> = ({ onTrackSleepClick }) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-deep-blue mb-4 text-center">How did you sleep?</h2>
      <Button
        onClick={onTrackSleepClick}
        className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
      >
        Log Your Sleep
      </Button>
    </div>
  );
};

export default TrackSleepPrompt;
