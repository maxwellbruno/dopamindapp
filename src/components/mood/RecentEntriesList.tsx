
import React, { useState } from 'react';
import { MoodEntry, Mood } from '@/types/mood';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PremiumUpgradePrompt from '@/components/PremiumUpgradePrompt';

interface RecentEntriesListProps {
  moodEntries: MoodEntry[];
  allMoods: Mood[];
  isPremium: boolean;
}

const RecentEntriesList: React.FC<RecentEntriesListProps> = ({ moodEntries, allMoods, isPremium }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleViewClick = (e: React.MouseEvent) => {
    if (!isPremium) {
      e.preventDefault();
      setShowPrompt(true);
    }
  };

  // Adjust slice count based on tier
  const maxEntries = isPremium ? 10 : 3;

  return (
    <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h3 className="font-semibold text-deep-blue mb-3">Recent Entries</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {moodEntries.slice(0, maxEntries).map((entry) => {
          const moodData = allMoods.find(m => m.label === entry.mood);
          return (
            <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{moodData?.emoji}</span>
                  <span className="font-medium text-deep-blue">{entry.mood}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-deep-blue">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {entry.note && (
                <p className="text-sm text-deep-blue mb-1 truncate">{entry.note}</p>
              )}
              {entry.activities && entry.activities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.activities.map((activity, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded border bg-mint-green/10 border-mint-green text-deep-blue font-semibold"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {moodEntries.length === 0 && (
          <div className="text-center text-deep-blue py-4">
            No mood entries yet. Start tracking your mood!
          </div>
        )}
      </div>
      <div className="flex justify-end mt-3">
        {isPremium ? (
          <Link to="/mood/all">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleViewClick}
          >
            View All
          </Button>
        )}
      </div>
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm mx-auto">
            <PremiumUpgradePrompt
              feature="View All Mood Entries"
              description="Upgrade to Pro to access your complete mood entry history and spot emotional patterns."
              tier="pro"
              className="w-full"
            />
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => setShowPrompt(false)}
                className="bg-mint-green text-white px-4 py-2 rounded-md font-medium hover:bg-mint-green/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentEntriesList;
