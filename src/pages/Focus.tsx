import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import BreathingExercise from '../components/BreathingExercise';

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
          
          {/* Desktop grid for main focus content */}
          <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mb-6">
            {/* Left column: Session name, timer, session settings */}
            <div className="flex flex-col gap-6 md:col-span-2">
              <div className="dopamind-card p-6 animate-fade-in-up">
                <Input
                  placeholder="Name your focus session"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-white border-gray-300 text-deep-blue placeholder:text-text-light rounded-2xl h-12 focus:border-mint-green focus:ring-mint-green/20"
                />
              </div>

              <div className="dopamind-card p-8 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-6xl font-bold bg-gradient-to-r from-mint-green to-mint-green bg-clip-text text-transparent mb-4">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-text-light mb-6">
                  {isBreak ? 'Break Time' : 'Focus Time'} • {isBreak ? breakDuration : sessionDuration} min
                </p>
                <div className="flex gap-3 justify-center">
                  {!canStartSession ? (
                    <div className="text-center">
                      <p className="text-sm text-text-light mb-3">Free users: {todaySessions}/{maxFreeSessions} sessions today</p>
                      <Button 
                        disabled
                        className="bg-gray-300 text-gray-500 rounded-2xl px-8 h-12"
                      >
                        Daily Limit Reached
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={isRunning ? pauseTimer : startTimer}
                        className="bg-gradient-to-r from-mint-green to-mint-green text-white font-semibold rounded-2xl px-8 h-12 shadow-lg hover:scale-[1.02] transition-transform"
                      >
                        {isRunning ? 'Pause' : 'Start'}
                      </Button>
                      <Button 
                        onClick={resetTimer}
                        className="bg-deep-blue text-white rounded-2xl px-8 h-12 hover:bg-deep-blue/90"
                      >
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Session Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-dark font-medium">Session Duration</span>
                      <span className="text-text-light">{sessionDuration} min</span>
                      {!canCustomizeDuration && sessionDuration >= maxFreeSessionDuration && (
                        <span className="text-xs text-warm-orange bg-warm-orange/10 px-2 py-1 rounded-full">Free Limit</span>
                      )}
                    </div>
                    <input
                      type="range"
                      min="5"
                      max={canCustomizeDuration ? "240" : maxFreeSessionDuration.toString()}
                      value={sessionDuration}
                      onChange={(e) => handleSessionDurationChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10B981 0%, #10B981 ${((sessionDuration - 5) / (canCustomizeDuration ? 235 : 20)) * 100}%, #e5e7eb ${((sessionDuration - 5) / (canCustomizeDuration ? 235 : 20)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    {!canCustomizeDuration && (
                      <p className="text-xs text-text-light mt-1">Upgrade to Pro for custom durations up to 4 hours</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-dark font-medium">Break Duration</span>
                      <span className="text-text-light">{breakDuration} min</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10B981 0%, #10B981 ${((breakDuration - 5) / 25) * 100}%, #e5e7eb ${((breakDuration - 5) / 25) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar for desktop, collapses below md */}
            <div className="flex flex-col gap-6">
              <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Breathing Exercises</h3>
                <div className="space-y-3 mb-4">
                  {availableBreathingExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-light-gray rounded-2xl">
                      <div>
                        <p className="font-medium text-text-dark">{exercise.name}</p>
                        <p className="text-xs text-text-light">{exercise.description}</p>
                      </div>
                      <Button 
                        onClick={() => startBreathingExercise(exercise.id)}
                        size="sm"
                        className="bg-mint-green text-white rounded-xl hover:bg-mint-green/90"
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
                
                {!isPremium && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-text-light mb-2">Premium breathing exercises with Pro</p>
                    <div className="space-y-2">
                      {breathingExercises.filter(e => e.premium).slice(0, 2).map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-2xl opacity-50">
                          <div>
                            <p className="font-medium text-gray-400">{exercise.name} 🔒</p>
                            <p className="text-xs text-gray-400">{exercise.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Ambient Sounds</h3>
                <div className="space-y-3">
                  {availableSounds.map((sound) => (
                    <div key={sound.id} className="flex items-center justify-between">
                      <span className="text-text-dark">{sound.name}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sound"
                          value={sound.id}
                          checked={selectedSound === sound.id}
                          onChange={(e) => setSelectedSound(e.target.value)}
                          className="text-mint-green"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {!isPremium && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-text-light mb-2">Premium sounds available with Pro</p>
                      <div className="space-y-2">
                        {soundOptions.filter(s => s.premium).slice(0, 2).map((sound) => (
                          <div key={sound.id} className="flex items-center justify-between opacity-50">
                            <span className="text-gray-400">{sound.name} 🔒</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Session Stats</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-text-dark">Total Sessions: {totalSessions}</div>
                      <div className="text-sm text-text-light">Current Streak: {currentStreak} days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* For mobile only, stack the premium prompt and its surrounding spacing */}
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
