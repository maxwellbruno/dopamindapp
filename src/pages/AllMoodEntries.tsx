
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSubscription } from '@/hooks/useSubscription';
import { MoodEntry, Mood } from '@/types/mood';
import { basicMoods, premiumMoods } from '@/data/moods';
import PremiumUpgradePrompt from '@/components/PremiumUpgradePrompt';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MinimalSpinner from '@/components/ui/MinimalSpinner';

const AllMoodEntries: React.FC = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ['mood_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      // Transform the data to match our MoodEntry interface
      return data.map(entry => ({
        ...entry,
        activities: Array.isArray(entry.activities) ? entry.activities as string[] : null
      }));
    },
    enabled: !!user,
  });

  const allMoods = [...basicMoods, ...premiumMoods];

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <PremiumUpgradePrompt
            feature="View All Mood Entries"
            description="Upgrade to Pro to access your complete mood entry history and spot emotional patterns."
            tier="pro"
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen bg-light-gray flex items-center justify-center"><MinimalSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 md:pt-8">
        <div className="max-w-md md:max-w-xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-deep-blue text-center mb-6 animate-fade-in-up">All Mood Entries</h1>
          {moodEntries.length === 0 && (
            <div className="text-center text-deep-blue py-6">
              No mood entries found.
            </div>
          )}
          <div className="space-y-4">
            {moodEntries.map(entry => {
              const mood = allMoods.find(m => m.label === entry.mood);
              return (
                <div key={entry.id} className="dopamind-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{mood?.emoji}</span>
                    <span className="font-semibold text-deep-blue">{entry.mood}</span>
                    <span className="ml-auto text-xs text-text-light">
                      {new Date(entry.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-xs text-deep-blue mb-2">Intensity: {entry.intensity}/5</div>
                  {entry.note && (
                    <div className="mb-1 text-sm text-deep-blue bg-light-gray p-2 rounded">{entry.note}</div>
                  )}
                  {entry.activities && entry.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.activities.map((activity, idx) => (
                        <span key={idx} className="px-2 py-1 rounded text-xs bg-light-gray border text-deep-blue">
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMoodEntries;
