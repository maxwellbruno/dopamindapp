
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionData } from '@/types/mood';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { useBreathingExercise } from '@/hooks/useBreathingExercise';
import { soundOptions, breathingExercises, maxFreeSessionDuration, maxFreeSessions } from '@/constants/focusConstants';
import FocusLayout from '@/components/focus/FocusLayout';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import { Button } from '@/components/ui/button';

const initialSubscription: SubscriptionData = {
  isPro: false,
  isElite: false,
  subscriptionEnd: null,
  tier: 'free'
};

const Focus: React.FC = () => {
  const { user } = useAuth();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', initialSubscription);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    setAudioPlayer(audio);

    return () => {
      audio.pause();
      setAudioPlayer(null);
    };
  }, []);

  useEffect(() => {
    if (!audioPlayer) return;

    if (selectedSound) {
      const sound = soundOptions.find(s => s.id === selectedSound);
      if (sound?.url) {
        if (audioPlayer.src !== sound.url) {
            audioPlayer.src = sound.url;
        }
        audioPlayer.play().catch(e => console.error("Error playing audio:", e));
      }
    } else {
      audioPlayer.pause();
    }
  }, [selectedSound, audioPlayer]);

  // Don't wait to render whole page; only sidebar stats use isLoading
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

  const timerLogic = useFocusTimer();
  const breathingLogic = useBreathingExercise();

  const totalSessions = focusStats?.total_sessions || 0;
  const currentStreak = focusStats?.current_streak || 0;
  const todaySessions = focusStats?.today_sessions_count || 0;

  const isPremium = subscription.isPro || subscription.isElite;
  const canStartSession = isPremium || todaySessions < maxFreeSessions;
  const canCustomizeDuration = isPremium;

  const availableSounds = soundOptions.filter(sound => sound.type === 'ambient' && (!sound.premium || isPremium));
  const allAmbientSoundsForSidebar = soundOptions.filter(sound => sound.type === 'ambient');
  const availableBreathingExercises = breathingExercises.filter(exercise => !exercise.premium || isPremium);

  const handleSessionDurationChange = (value: number) => {
    if (!canCustomizeDuration && value > maxFreeSessionDuration) return;
    timerLogic.handleSessionDurationChange(value);
  };

  const startTimer = () => {
    if (!canStartSession) return;
    timerLogic.startTimer();
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-text-dark mb-6 text-center animate-fade-in-up">Focus</h1>

          {/* Meditation Frequencies Elite Exclusive Tile removed */}

          <FocusLayout
            sessionName={timerLogic.sessionName}
            setSessionName={timerLogic.setSessionName}
            timeLeft={timerLogic.timeLeft}
            formatTime={timerLogic.formatTime}
            isBreak={timerLogic.isBreak}
            breakDuration={timerLogic.breakDuration}
            sessionDuration={timerLogic.sessionDuration}
            isRunning={timerLogic.isRunning}
            canStartSession={canStartSession}
            todaySessions={todaySessions}
            maxFreeSessions={maxFreeSessions}
            pauseTimer={timerLogic.pauseTimer}
            startTimer={startTimer}
            resetTimer={timerLogic.resetTimer}
            canCustomizeDuration={canCustomizeDuration}
            maxFreeSessionDuration={maxFreeSessionDuration}
            handleSessionDurationChange={handleSessionDurationChange}
            setBreakDuration={timerLogic.setBreakDuration}
            availableBreathingExercises={availableBreathingExercises}
            startBreathingExercise={breathingLogic.startBreathingExercise}
            isPremium={isPremium}
            isElite={subscription.isElite}
            breathingExercises={breathingExercises}
            availableSounds={availableSounds}
            selectedSound={selectedSound}
            setSelectedSound={setSelectedSound}
            soundOptions={allAmbientSoundsForSidebar}
            totalSessions={totalSessions}
            currentStreak={currentStreak}
            isLoading={isLoading}
            isBreathing={breathingLogic.isBreathing}
            selectedBreathingExercise={breathingLogic.selectedBreathingExercise}
            stopBreathingExercise={breathingLogic.stopBreathingExercise}
          />

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
