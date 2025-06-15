import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import BreathingExercise from '../components/BreathingExercise';

import SessionTimer from '../components/focus/SessionTimer';
import SessionSettings from '../components/focus/SessionSettings';
import BreathingExercisesSidebar from '../components/focus/BreathingExercisesSidebar';
import AmbientSoundsSidebar from '../components/focus/AmbientSoundsSidebar';
import SessionStatsSidebar from '../components/focus/SessionStatsSidebar';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Focus: React.FC = () => {
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
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

  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');
  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0}');

  const totalSessions = sessions.length;
  const currentStreak = stats.currentStreak || 0;

  const isPremium = subscription.isPro || subscription.isElite;

  // Free tier limitations
  const maxFreeSessionDuration = 25;
  const maxFreeSessions = 3;
  const todaySessions = sessions.filter((session: any) => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const canStartSession = isPremium || todaySessions < maxFreeSessions;
  const canCustomizeDuration = isPremium;

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
      const newSession = {
        id: Date.now(),
        name: sessionName || 'Focus Session',
        duration: sessionDuration,
        date: new Date().toISOString(),
      };
      
      const updatedSessions = [...sessions, newSession];
      localStorage.setItem('dopamind_sessions', JSON.stringify(updatedSessions));
      
      const updatedStats = {
        ...stats,
        totalFocusMinutes: stats.totalFocusMinutes + sessionDuration,
        currentStreak: stats.currentStreak + 1,
      };
      localStorage.setItem('dopamind_stats', JSON.stringify(updatedStats));
      
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
              />
            </div>
          </div>

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
