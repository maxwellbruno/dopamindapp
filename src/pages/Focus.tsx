
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { useBreathingExercise } from '@/hooks/useBreathingExercise';
import { useSubscription } from '@/hooks/useSubscription';
import { soundOptions, breathingExercises, maxFreeSessionDuration, maxFreeSessions } from '@/constants/focusConstants';
import FocusLayout from '@/components/focus/FocusLayout';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';

const Focus: React.FC = () => {
  const { user } = useAuth();
  const { isPremium, isElite } = useSubscription();
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio player
  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.loop = true;
      audioPlayerRef.current.volume = 0.5;
    }
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  // Handle sound selection and playback
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;

    if (selectedSound) {
      const sound = soundOptions.find(s => s.id === selectedSound);
      if (sound?.url) {
        console.log('Playing sound:', sound.name, sound.url);
        
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = sound.url;
        
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              setTimeout(() => {
                audioPlayer.play().catch(e => console.error("Retry failed:", e));
              }, 1000);
            });
        }
      }
    } else {
      console.log('Stopping audio playback');
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
  }, [selectedSound]);

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
            isElite={isElite}
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
