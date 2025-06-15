
import React from 'react';
import { MoodEntry } from '@/types/mood';

interface WellnessSuggestionProps {
  moodEntries: MoodEntry[];
}

const WellnessSuggestion: React.FC<WellnessSuggestionProps> = ({ moodEntries }) => {
  const getMoodSuggestion = () => {
    const recentEntries = moodEntries.slice(0, 3);
    const negativeMoods = recentEntries.filter(entry => ['Sad', 'Neutral', 'Angry'].includes(entry.mood));
    
    if (negativeMoods.length >= 2) {
      return "Consider taking a short walk or doing a breathing exercise. Small actions can make a big difference! 🌱";
    }
    return "You're doing great! Keep up with your positive habits. 🌟";
  };

  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-semibold text-deep-blue mb-4">Wellness Suggestion</h3>
      <p className="text-deep-blue">{getMoodSuggestion()}</p>
    </div>
  );
};

export default WellnessSuggestion;
