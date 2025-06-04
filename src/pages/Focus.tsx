
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FocusSession {
  id: string;
  name: string;
  duration: number;
  completed: boolean;
  date: string;
}

const Focus: React.FC = () => {
  const [sessionName, setSessionName] = useState('');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [ambientSound, setAmbientSound] = useState<string>('none');
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('dopamind_sessions', []);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft((isBreak ? breakDuration : workDuration) * 60);
  }, [workDuration, breakDuration, isBreak]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isBreathing) {
      breathIntervalRef.current = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === 'in') return 'hold';
          if (prev === 'hold') return 'out';
          return 'in';
        });
      }, 4000);
    } else {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    }

    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [isBreathing]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (!isBreak) {
      const newSession: FocusSession = {
        id: Date.now().toString(),
        name: sessionName || 'Focus Session',
        duration: workDuration,
        completed: true,
        date: new Date().toISOString()
      };
      setSessions(prev => [newSession, ...prev]);
      
      // Update stats
      const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
      stats.totalFocusMinutes += workDuration;
      localStorage.setItem('dopamind_stats', JSON.stringify(stats));
    }
    
    setIsBreak(!isBreak);
    setTimeLeft((isBreak ? workDuration : breakDuration) * 60);
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((isBreak ? breakDuration : workDuration) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'in': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'out': return 'Breathe Out';
    }
  };

  const ambientSounds = [
    { id: 'none', name: 'Silence', icon: '🔇' },
    { id: 'ocean', name: 'Ocean Waves', icon: '🌊' },
    { id: 'forest', name: 'Forest Sounds', icon: '🌲' },
    { id: 'cafe', name: 'Café Ambience', icon: '☕' },
    { id: 'rain', name: 'Gentle Rain', icon: '🌧️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-serenity-blue/5 to-mindful-mint/10 pb-20">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-10 w-40 h-40 bg-lavender-haze/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-serenity-blue/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center animate-fade-in-up">
            Focus Session
          </h1>

          {!isBreathing ? (
            <>
              <div className="glass-card rounded-3xl p-8 neuro-shadow mb-6 animate-fade-in-up">
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className="relative mb-6">
                    {/* Outer ring progress */}
                    <div className="w-48 h-48 mx-auto relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - ((isBreak ? breakDuration : workDuration) * 60 - timeLeft) / ((isBreak ? breakDuration : workDuration) * 60))}`}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#A3C9F9" />
                            <stop offset="100%" stopColor="#A8E6CF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Timer Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-mono font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent mb-2">
                            {formatTime(timeLeft)}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {isBreak ? 'Break Time' : sessionName || 'Focus Time'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex justify-center space-x-4 mb-6">
                    {!isActive ? (
                      <Button 
                        onClick={startTimer} 
                        className="bg-gradient-to-r from-serenity-blue to-mindful-mint hover:from-serenity-blue/90 hover:to-mindful-mint/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                      >
                        Start Focus
                      </Button>
                    ) : (
                      <Button 
                        onClick={pauseTimer} 
                        className="bg-gradient-to-r from-gentle-amber to-tranquil-green hover:from-gentle-amber/90 hover:to-tranquil-green/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        Pause
                      </Button>
                    )}
                    <Button 
                      onClick={resetTimer} 
                      className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Ambient Sounds */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">Ambient Sounds</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ambientSounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => setAmbientSound(sound.id)}
                        className={`p-3 rounded-xl text-center transition-all duration-300 ${
                          ambientSound === sound.id
                            ? 'bg-gradient-to-br from-serenity-blue to-mindful-mint text-white shadow-lg'
                            : 'bg-white/60 hover:bg-white/80 text-gray-700'
                        }`}
                      >
                        <div className="text-lg mb-1">{sound.icon}</div>
                        <div className="text-xs font-medium">{sound.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {!isBreak && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="sessionName" className="text-sm font-semibold text-gray-700">Session Name</Label>
                      <Input
                        id="sessionName"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="What are you working on?"
                        className="mt-2 bg-white/60 border-gray-200 rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="workDuration" className="text-sm font-semibold text-gray-700">Work (min)</Label>
                        <Input
                          id="workDuration"
                          type="number"
                          value={workDuration}
                          onChange={(e) => setWorkDuration(Number(e.target.value))}
                          min="1"
                          max="120"
                          className="mt-2 bg-white/60 border-gray-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="breakDuration" className="text-sm font-semibold text-gray-700">Break (min)</Label>
                        <Input
                          id="breakDuration"
                          type="number"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          min="1"
                          max="30"
                          className="mt-2 bg-white/60 border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Breathing Exercise Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setIsBreathing(true)}
                    className="bg-gradient-to-r from-lavender-haze to-serenity-blue hover:from-lavender-haze/90 hover:to-serenity-blue/90 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    🫁 Breathing Exercise
                  </Button>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="glass-card rounded-3xl p-6 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">📊</span>
                  Recent Sessions
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center py-3 px-4 bg-white/40 rounded-xl border border-gray-100">
                      <div>
                        <div className="font-medium text-sm text-gray-800">{session.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-semibold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent">
                        {session.duration}m
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">🌱</div>
                      <p className="text-sm">No sessions yet. Start your first focus session!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-3xl p-8 neuro-shadow text-center animate-fade-in-up">
              <h2 className="text-xl font-semibold mb-8 text-gray-800">Breathing Exercise</h2>
              
              <div className="mb-8">
                <div 
                  className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-serenity-blue to-lavender-haze flex items-center justify-center transition-all duration-4000 shadow-2xl ${
                    breathPhase === 'in' ? 'scale-110 shadow-serenity-blue/30' : 
                    breathPhase === 'hold' ? 'scale-110 shadow-lavender-haze/30' : 
                    'scale-90 shadow-mindful-mint/30'
                  } ${breathPhase === 'in' ? 'animate-breathe' : ''}`}
                >
                  <div className="text-white font-semibold text-lg">
                    {getBreathInstruction()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Follow the circle's rhythm to breathe deeply and find your center
              </p>
              
              <Button 
                onClick={() => setIsBreathing(false)} 
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
              >
                Return to Timer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Focus;
