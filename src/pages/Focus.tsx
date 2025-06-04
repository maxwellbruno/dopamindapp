
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Focus Session</h1>

          {!isBreathing ? (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="text-center mb-6">
                  <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg text-gray-600">
                    {isBreak ? 'Break Time' : sessionName || 'Focus Time'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${isBreak ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ 
                        width: `${((isBreak ? breakDuration : workDuration) * 60 - timeLeft) / ((isBreak ? breakDuration : workDuration) * 60) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                  {!isActive ? (
                    <Button onClick={startTimer} className="bg-green-500 hover:bg-green-600">
                      Start
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} className="bg-yellow-500 hover:bg-yellow-600">
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="outline">
                    Reset
                  </Button>
                </div>

                {!isBreak && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="sessionName">Session Name</Label>
                      <Input
                        id="sessionName"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="What are you working on?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="workDuration">Work (min)</Label>
                        <Input
                          id="workDuration"
                          type="number"
                          value={workDuration}
                          onChange={(e) => setWorkDuration(Number(e.target.value))}
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <Label htmlFor="breakDuration">Break (min)</Label>
                        <Input
                          id="breakDuration"
                          type="number"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          min="1"
                          max="30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setIsBreathing(true)}
                    variant="outline"
                    className="text-blue-600 border-blue-600"
                  >
                    🫁 Breathing Exercise
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Sessions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <div className="font-medium text-sm">{session.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-blue-600">{session.duration}m</div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No sessions yet. Start your first focus session!
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-8">Breathing Exercise</h2>
              
              <div className="mb-8">
                <div 
                  className={`w-32 h-32 mx-auto rounded-full bg-blue-500 flex items-center justify-center transition-all duration-4000 ${
                    breathPhase === 'in' ? 'scale-110' : breathPhase === 'hold' ? 'scale-110' : 'scale-90'
                  }`}
                >
                  <div className="text-white font-semibold">
                    {getBreathInstruction()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8">
                Follow the circle to breathe deeply and relax your mind
              </p>
              
              <Button onClick={() => setIsBreathing(false)} variant="outline">
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
