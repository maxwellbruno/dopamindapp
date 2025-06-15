import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { useBreathingExercise } from '@/hooks/useBreathingExercise';
import { useSubscription } from '@/hooks/useSubscription';
import { soundOptions, breathingExercises, maxFreeSessionDuration, maxFreeSessions, SOUND_TRACKS } from '@/constants/focusConstants';
import FocusLayout from '@/components/focus/FocusLayout';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';

const Focus: React.FC = () => {
  const { user } = useAuth();
  const { isPremium, isElite } = useSubscription();
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<any[]>([]);
  const currentTrackIndexRef = useRef(0);

  // Initialize audio player
  useEffect(() => {
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;
    audioPlayerRef.current = audioPlayer;

    const handleTrackEnded = () => {
      if (playlistRef.current.length > 0) {
        currentTrackIndexRef.current = (currentTrackIndexRef.current + 1) % playlistRef.current.length;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = playlistRef.current[currentTrackIndexRef.current].url;
          audioPlayerRef.current.play().catch(e => console.error("Audio play failed on track end:", e));
        }
      }
    };
    audioPlayer.addEventListener('ended', handleTrackEnded);

    return () => {
      audioPlayer.removeEventListener('ended', handleTrackEnded);
      audioPlayer.pause();
    };
  }, []);

  // Handle sound selection and playback
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;

    if (selectedSound) {
      const sound = soundOptions.find(s => s.id === selectedSound);

      // It's a playlist
      if (sound?.hasGenrePage && SOUND_TRACKS[sound.id]) {
        const tracks = SOUND_TRACKS[sound.id].filter(t => !t.premium);
        playlistRef.current = tracks;
        currentTrackIndexRef.current = 0;

        if (tracks.length > 0) {
          audioPlayer.loop = false;
          audioPlayer.src = tracks[0].url;
          audioPlayer.play().catch(e => console.error("Audio play failed on start:", e));
        }
      }
      // It's a single track
      else if (sound?.url) {
        playlistRef.current = [];
        audioPlayer.loop = true;
        audioPlayer.src = sound.url;
        audioPlayer.play().catch(e => console.error("Audio play failed on start:", e));
      }
    } else {
      audioPlayer.pause();
      playlistRef.current = [];
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
