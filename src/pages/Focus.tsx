import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';

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
  const [breathPhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathTimer, setBreatheTimer] = useState(4);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);

  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');
  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0}');

  const totalSessions = sessions.length;
  const currentStreak = stats.currentStreak || 0;

  const isPremium = subscription.isPro || subscription.isElite;

  // Free tier limitations
  const maxFreeSessionDuration = 25; // minutes
  const maxFreeSessions = 3; // per day
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreatheTimer(prev => {
          if (prev <= 1) {
            setBreathePhase(current => {
              if (current === 'in') return 'hold';
              if (current === 'hold') return 'out';
              return 'in';
            });
            return current === 'hold' ? 2 : 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

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

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathePhase('in');
    setBreatheTimer(4);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
  };

  const soundOptions = [
    { id: 'lofi', name: 'LoFi Music', premium: false },
    { id: 'whitenoise', name: 'White Noise', premium: false },
    { id: 'ocean', name: 'Ocean Waves', premium: true },
    { id: 'forest', name: 'Forest Sounds', premium: true },
    { id: 'cafe', name: 'Café Ambience', premium: true },
    { id: 'rain', name: 'Gentle Rain', premium: true },
  ];

  const availableSounds = soundOptions.filter(sound => !sound.premium || isPremium);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-gray-50 to-blue-50 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-midnight-slate mb-6 text-center animate-fade-in-up">Focus</h1>

          {/* Session Input */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up">
            <Input
              placeholder="Name your focus session"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-slate-50 border-zen-ash text-midnight-slate placeholder:text-slate-400 rounded-2xl h-12 focus:border-lavender-haze focus:ring-lavender-haze/20"
            />
          </div>

          {/* Timer Display */}
          <div className="glass-card rounded-3xl p-8 neuro-shadow mb-6 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-6xl font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent mb-4">
              {formatTime(timeLeft)}
            </div>
            <p className="text-slate-600 mb-6">
              {isBreak ? 'Break Time' : 'Focus Time'} • {isBreak ? breakDuration : sessionDuration} min
            </p>

            <div className="flex gap-3 justify-center">
              {!canStartSession ? (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-3">Free users: {todaySessions}/{maxFreeSessions} sessions today</p>
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
                    className="bg-gradient-to-r from-serenity-blue to-mindful-mint text-white font-semibold rounded-2xl px-8 h-12 neuro-shadow hover:scale-[1.02] transition-transform"
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    onClick={resetTimer}
                    variant="outline"
                    className="rounded-2xl px-8 h-12 border-zen-ash"
                  >
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Session Settings */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Session Settings</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-medium">Session Duration</span>
                  <span className="text-slate-600">{sessionDuration} min</span>
                  {!canCustomizeDuration && sessionDuration >= maxFreeSessionDuration && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Free Limit</span>
                  )}
                </div>
                <input
                  type="range"
                  min="5"
                  max={canCustomizeDuration ? "240" : maxFreeSessionDuration.toString()}
                  value={sessionDuration}
                  onChange={(e) => handleSessionDurationChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                {!canCustomizeDuration && (
                  <p className="text-xs text-slate-500 mt-1">Upgrade to Pro for custom durations up to 4 hours</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-medium">Break Duration</span>
                  <span className="text-slate-600">{breakDuration} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Session Stats</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-gentle-amber to-tranquil-green rounded-full flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-midnight-slate">Total Sessions: {totalSessions}</div>
                  <div className="text-sm text-slate-600">Current Streak: {currentStreak} days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Breathing Exercise */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Breathing Exercise</h3>
            
            {!isBreathing ? (
              <div className="text-center">
                <p className="text-slate-600 mb-4">Practice mindful breathing to center yourself</p>
                <Button 
                  onClick={startBreathingExercise}
                  className="bg-gradient-to-r from-lavender-haze to-mindful-mint text-white font-semibold rounded-2xl px-6 h-10 neuro-shadow"
                >
                  Start Breathing
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg transition-all duration-1000 ${
                  breathPhase === 'in' ? 'bg-serenity-blue scale-110' :
                  breathPhase === 'hold' ? 'bg-lavender-haze scale-110' :
                  'bg-mindful-mint scale-90'
                }`}>
                  {breathTimer}
                </div>
                <p className="text-lg font-semibold text-midnight-slate mb-2">
                  {breathPhase === 'in' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
                </p>
                <Button 
                  onClick={stopBreathingExercise}
                  variant="outline"
                  className="rounded-2xl"
                >
                  Stop
                </Button>
              </div>
            )}
          </div>

          {/* Ambient Sounds */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Ambient Sounds</h3>
            
            <div className="space-y-3">
              {availableSounds.map((sound) => (
                <div key={sound.id} className="flex items-center justify-between">
                  <span className="text-slate-700">{sound.name}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sound"
                      value={sound.id}
                      checked={selectedSound === sound.id}
                      onChange={(e) => setSelectedSound(e.target.value)}
                      className="text-serenity-blue"
                    />
                  </div>
                </div>
              ))}
              
              {!isPremium && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Premium sounds available with Pro</p>
                  <div className="space-y-2">
                    {soundOptions.filter(s => s.premium).slice(0, 2).map((sound) => (
                      <div key={sound.id} className="flex items-center justify-between opacity-50">
                        <span className="text-slate-400">{sound.name} 🔒</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Free User Upgrade Prompt */}
          {!canStartSession && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
