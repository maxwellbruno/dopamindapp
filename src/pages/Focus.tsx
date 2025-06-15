
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

  const playCurrentTrack = () => {
    const audioPlayer = audioPlayerRef.current;
    const playlist = playlistRef.current;
    if (!audioPlayer || playlist.length === 0) return;

    const trackIndex = currentTrackIndexRef.current;
    const track = playlist[trackIndex];

    audioPlayer.src = track.url;
    audioPlayer.play().catch(e => console.error("Audio play failed:", e));

    if ('mediaSession' in navigator) {
      const soundOption = soundOptions.find(s => s.id === selectedSound);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: 'Dopamind',
        album: soundOption ? soundOption.name : 'Focus Sounds',
        artwork: [
          { src: 'pwa-192x192.png', type: 'image/png', sizes: '192x192' },
          { src: 'pwa-512x512.png', type: 'image/png', sizes: '512x512' }
        ]
      });
      navigator.mediaSession.playbackState = "playing";
    }
  };

  const pausePlayback = () => {
    audioPlayerRef.current?.pause();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  };

  const playNextTrack = () => {
    if (playlistRef.current.length > 1) {
      currentTrackIndexRef.current = (currentTrackIndexRef.current + 1) % playlistRef.current.length;
      playCurrentTrack();
    }
  };

  const playPreviousTrack = () => {
    if (playlistRef.current.length > 1) {
      currentTrackIndexRef.current = (currentTrackIndexRef.current - 1 + playlistRef.current.length) % playlistRef.current.length;
      playCurrentTrack();
    }
  };

  // Initialize audio player
  useEffect(() => {
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;
    audioPlayerRef.current = audioPlayer;

    const handleTrackEnded = () => {
      playNextTrack();
    };
    audioPlayer.addEventListener('ended', handleTrackEnded);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => playCurrentTrack());
      navigator.mediaSession.setActionHandler('pause', () => pausePlayback());
      navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
    }

    return () => {
      audioPlayer.removeEventListener('ended', handleTrackEnded);
      audioPlayer.pause();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.playbackState = "none";
      }
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
        const tracks = SOUND_TRACKS[sound.id].filter(t => !t.premium || isPremium);
        playlistRef.current = tracks;
        currentTrackIndexRef.current = 0;

        if (tracks.length > 0) {
          audioPlayer.loop = false;
          playCurrentTrack();
        }
      }
      // It's a single track
      else if (sound?.url) {
        playlistRef.current = [{ name: sound.name, url: sound.url }];
        currentTrackIndexRef.current = 0;
        audioPlayer.loop = true;
        playCurrentTrack();
      }
    } else {
      pausePlayback();
      playlistRef.current = [];
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
      }
    }
  }, [selectedSound, isPremium]);

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
