import React, { useState } from 'react';
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
import Button from '@/components/Button';

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

  const availableSounds = soundOptions.filter(sound => !sound.premium || isPremium);
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

          {/* Meditation Frequencies Elite Exclusive Tile */}
          {subscription.isElite && (
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div
                className="dopamind-card bg-gradient-to-r from-mint-green/90 to-warm-orange/80 p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 hover:scale-[1.03] transition cursor-pointer"
                onClick={() => window.location.assign("/meditation/frequencies")}
                role="button"
                tabIndex={0}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-2xl">🧘‍♂️</span>
                    Meditation Frequencies <span className="ml-2 text-base px-2 py-1 rounded-full bg-warm-orange/90 text-white font-bold">Elite</span>
                  </span>
                  <span className="text-xs text-white/80 mt-1">
                    Brainwaves &amp; Binaural Frequencies for deep meditation &amp; focus.
                  </span>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button
                    className="bg-white text-mint-green font-bold rounded-xl px-6 shadow"
                    onClick={e => {
                      e.stopPropagation();
                      window.location.assign("/meditation/frequencies");
                    }}
                  >
                    Explore
                  </Button>
                </div>
              </div>
            </div>
          )}

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
            breathingExercises={breathingExercises}
            availableSounds={availableSounds}
            selectedSound={selectedSound}
            setSelectedSound={setSelectedSound}
            soundOptions={soundOptions}
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
