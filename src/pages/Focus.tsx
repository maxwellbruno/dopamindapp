import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import BreathingExercise from '../components/BreathingExercise';

import SessionTimer from '../components/focus/SessionTimer';
import SessionSettings from '../components/focus/SessionSettings';
import BreathingExercisesSidebar from '../components/focus/BreathingExercisesSidebar';
import AmbientSoundsSidebar from '../components/focus/AmbientSoundsSidebar';
import SessionStatsSidebar from '../components/focus/SessionStatsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { SubscriptionData } from '@/types/mood';

const initialSubscription: SubscriptionData = {
  isPro: false,
  isElite: false,
  subscriptionEnd: null,
  tier: 'free'
};

const Focus: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', initialSubscription);

  const { data: focusStats, isLoading } = useQuery({
      queryKey: ['focusStats', user?.id],
      queryFn: async () => {
          if (!user) return null;
          const { data, error } = await supabase.rpc('get_user_focus_stats');
          if (error) throw new Error(error.message);
          return data;
      },
      enabled: !!user,
  });

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDuration, setSessionDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [selectedBreathingExercise, setSelectedBreathingExercise] = useState<string | null>(null);

  const totalSessions = focusStats?.total_sessions || 0;
  const currentStreak = focusStats?.current_streak || 0;
  const todaySessions = focusStats?.today_sessions_count || 0;

  const isPremium = subscription.isPro || subscription.isElite;

  // Free tier limitations
  const maxFreeSessionDuration = 25;
  const maxFreeSessions = 3;

  const canStartSession = isPremium || todaySessions < maxFreeSessions;
  const canCustomizeDuration = isPremium;

  const saveSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
        if (!user) throw new Error("User not authenticated");
        
        const { error: sessionError } = await supabase.from('focus_sessions').insert({
            user_id: user.id,
            name: sessionName || 'Focus Session',
            duration: duration,
        });
        if (sessionError) throw new Error(sessionError.message);

        const { error: statsError } = await supabase.rpc('update_user_stats_on_session_complete', {
            session_duration: duration
        });
        if (statsError) throw new Error(statsError.message);
    },
    onSuccess: () => {
        toast({ title: "Session saved!", description: "Your progress has been updated." });
        queryClient.invalidateQueries({ queryKey: ['focusStats'] });
        queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
        queryClient.invalidateQueries({ queryKey: ['profileStats'] });
    },
    onError: (error: Error) => {
        toast({ title: "Error saving session", description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      saveSessionMutation.mutate(sessionDuration);
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(sessionDuration * 60);
    }
  };

  const startTimer = () => {
    if (!canStartSession) return;
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(sessionDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSessionDurationChange = (value: number) => {
    if (!canCustomizeDuration && value > maxFreeSessionDuration) return;
    setSessionDuration(value);
    if (!isRunning) {
      setTimeLeft(value * 60);
    }
  };

  const startBreathingExercise = (exerciseType?: string) => {
    setSelectedBreathingExercise(exerciseType || 'basic');
    setIsBreathing(true);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    setSelectedBreathingExercise(null);
  };

  const soundOptions = [
    { id: 'lofi', name: 'LoFi Music', premium: false },
    { id: 'whitenoise', name: 'White Noise', premium: false },
    { id: 'ocean', name: 'Ocean Waves', premium: true },
    { id: 'forest', name: 'Forest Sounds', premium: true },
    { id: 'cafe', name: 'Café Ambience', premium: true },
    { id: 'rain', name: 'Gentle Rain', premium: true },
  ];

  const breathingExercises = [
    { id: 'basic', name: '4-7-8 Breathing', description: 'Classic relaxation technique', premium: false },
    { id: 'box', name: 'Box Breathing', description: 'Navy SEAL technique for focus', premium: true },
    { id: 'coherent', name: 'Coherent Breathing', description: 'Heart rate variability training', premium: true },
    { id: 'wim', name: 'Wim Hof Method', description: 'Energizing breath work', premium: true },
    { id: 'alternate', name: 'Alternate Nostril', description: 'Balancing technique', premium: true },
  ];

  const availableSounds = soundOptions.filter(sound => !sound.premium || isPremium);
  const availableBreathingExercises = breathingExercises.filter(exercise => !exercise.premium || isPremium);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-text-dark mb-6 text-center animate-fade-in-up">Focus</h1>

          <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mb-6">
            {/* Main left: Session name, timer, settings (2/3 left on desktop) */}
            <div className="flex flex-col gap-6 md:col-span-2">
              <SessionTimer
                sessionName={sessionName}
                setSessionName={setSessionName}
                timeLeft={timeLeft}
                formatTime={formatTime}
                isBreak={isBreak}
                breakDuration={breakDuration}
                sessionDuration={sessionDuration}
                isRunning={isRunning}
                canStartSession={canStartSession}
                todaySessions={todaySessions}
                maxFreeSessions={maxFreeSessions}
                pauseTimer={pauseTimer}
                startTimer={startTimer}
                resetTimer={resetTimer}
              />
              <SessionSettings
                sessionDuration={sessionDuration}
                breakDuration={breakDuration}
                canCustomizeDuration={canCustomizeDuration}
                maxFreeSessionDuration={maxFreeSessionDuration}
                handleSessionDurationChange={handleSessionDurationChange}
                setBreakDuration={setBreakDuration}
              />
            </div>

            {/* Right sidebar, desktop only */}
            <div className="flex flex-col gap-6">
              <BreathingExercisesSidebar
                availableBreathingExercises={availableBreathingExercises}
                startBreathingExercise={startBreathingExercise}
                isPremium={isPremium}
                breathingExercises={breathingExercises}
              />
              <AmbientSoundsSidebar
                availableSounds={availableSounds}
                selectedSound={selectedSound}
                setSelectedSound={setSelectedSound}
                isPremium={isPremium}
                soundOptions={soundOptions}
              />
              <SessionStatsSidebar
                totalSessions={totalSessions}
                currentStreak={currentStreak}
                isPremium={isPremium}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Modal/Overlay for Breathing Exercise */}
          {isBreathing && selectedBreathingExercise && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-deep-blue max-w-sm w-full p-6 rounded-2xl shadow-2xl relative animate-fade-in-up">
                <BreathingExercise
                  exerciseType={selectedBreathingExercise}
                  onStop={stopBreathingExercise}
                />
                {/* Close button, optional */}
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                  aria-label="Close"
                  onClick={stopBreathingExercise}
                >×</button>
              </div>
            </div>
          )}

          {!canStartSession && (
            <div className="animate-fade-in-up md:max-w-2xl md:mx-auto" style={{ animationDelay: '0.6s' }}>
              <PremiumUpgradePrompt 
                feature="Unlimited Focus Sessions"
                description="Remove daily limits and access custom session durations, premium soundscapes, and advanced analytics."
                tier="pro"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Focus;
