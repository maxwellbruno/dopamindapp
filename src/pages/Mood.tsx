import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MoodEntry, SubscriptionData } from '@/types/mood';
import { basicMoods, premiumMoods, basicActivities, premiumActivities } from '@/data/moods';
import MoodForm from '@/components/mood/MoodForm';
import TrackMoodPrompt from '@/components/mood/TrackMoodPrompt';
import MoodCalendar from '@/components/mood/MoodCalendar';
import WellnessSuggestion from '@/components/mood/WellnessSuggestion';
import RecentEntriesList from '@/components/mood/RecentEntriesList';
import MinimalSpinner from '@/components/ui/MinimalSpinner';

const Mood: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('dopamind_moods', []);
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium = subscription.isPro || subscription.isElite;

  const allMoods = isPremium ? [...basicMoods, ...premiumMoods] : basicMoods;
  const allActivities = isPremium ? [...basicActivities, ...premiumActivities] : basicActivities;

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleCustomActivityAdd = () => {
    if (customActivity.trim() && !selectedActivities.includes(customActivity.trim())) {
      setSelectedActivities(prev => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood || 'Happy',
      intensity,
      note,
      activities: selectedActivities,
      date: new Date().toISOString()
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    
    // Update stats
    const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
    stats.moodEntries += 1;
    localStorage.setItem('dopamind_stats', JSON.stringify(stats));

    // Reset form
    setSelectedMood('');
    setIntensity(3);
    setNote('');
    setSelectedActivities([]);
    setCustomActivity('');
    setShowForm(false);
  };

  if (isLoading) {
    return <MinimalSpinner />;
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 md:pt-0">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-deep-blue text-center mb-6 animate-fade-in-up">Mood Tracker</h1>
          
          {showForm ? (
            <MoodForm
              onClose={() => setShowForm(false)}
              allMoods={allMoods}
              isPremium={isPremium}
              selectedMood={selectedMood}
              setSelectedMood={setSelectedMood}
              intensity={intensity}
              setIntensity={setIntensity}
              note={note}
              setNote={setNote}
              allActivities={allActivities}
              selectedActivities={selectedActivities}
              handleActivityToggle={handleActivityToggle}
              customActivity={customActivity}
              setCustomActivity={setCustomActivity}
              handleCustomActivityAdd={handleCustomActivityAdd}
              handleSubmit={handleSubmit}
            />
          ) : (
            <>
              <TrackMoodPrompt onTrackMoodClick={() => setShowForm(true)} />
              <MoodCalendar moodEntries={moodEntries} allMoods={allMoods} />
              <WellnessSuggestion moodEntries={moodEntries} />
              <RecentEntriesList moodEntries={moodEntries} allMoods={allMoods} isPremium={isPremium} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mood;
