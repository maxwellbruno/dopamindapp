
import React from 'react';
import { Button } from '@/components/ui/button';

interface TrackMoodPromptProps {
  onTrackMoodClick: () => void;
}

const TrackMoodPrompt: React.FC<TrackMoodPromptProps> = ({ onTrackMoodClick }) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-deep-blue mb-4 text-center">How are you feeling today?</h2>
      <Button 
        onClick={onTrackMoodClick}
        className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
      >
        Track Your Mood
      </Button>
    </div>
  );
};

export default TrackMoodPrompt;
