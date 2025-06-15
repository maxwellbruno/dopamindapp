
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoodEntry, SubscriptionData } from '@/types/mood';
import { basicMoods, premiumMoods, basicActivities, premiumActivities } from '@/data/moods';
import MoodForm from '@/components/mood/MoodForm';
import TrackMoodPrompt from '@/components/mood/TrackMoodPrompt';
import MoodCalendar from '@/components/mood/MoodCalendar';
import WellnessSuggestion from '@/components/mood/WellnessSuggestion';
import RecentEntriesList from '@/components/mood/RecentEntriesList';
import MinimalSpinner from '@/components/ui/MinimalSpinner';
import { useToast } from "@/components/ui/use-toast";

const initialSubscription: SubscriptionData = {
  isPro: false,
  isElite: false,
  subscriptionEnd: null,
  tier: 'free'
};

const Mood: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', initialSubscription);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: moodEntries = [], isLoading: isLoadingEntries } = useQuery<MoodEntry[]>({
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
      return data;
    },
    enabled: !!user,
  });

  const addMoodMutation = useMutation({
    mutationFn: async (newEntry: {
      mood: string;
      intensity: number;
      note: string | null;
      activities: string[] | null;
      date: string;
    }) => {
      if (!user) throw new Error("User not logged in");
      
      const { error: insertError } = await supabase.from('mood_entries').insert([{ ...newEntry, user_id: user.id }]);
      if (insertError) throw insertError;

      const { error: rpcError } = await supabase.rpc('increment_mood_entries_count');
      if (rpcError) throw rpcError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood_entries', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['focusStats', user?.id] });
      
      setSelectedMood('');
      setIntensity(3);
      setNote('');
      setSelectedActivities([]);
      setCustomActivity('');
      setShowForm(false);
      
      toast({
        title: "Success",
        description: "Your mood has been logged.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to log mood: ${error.message}`,
        variant: "destructive",
      });
    },
  });

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

    addMoodMutation.mutate({
      mood: selectedMood || 'Happy',
      intensity,
      note: note || null,
      activities: selectedActivities.length > 0 ? selectedActivities : [],
      date: new Date().toISOString()
    });
  };

  if (isLoadingEntries) {
    return <div className="min-h-screen bg-light-gray flex items-center justify-center"><MinimalSpinner /></div>;
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
