
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SessionTimerProps {
  sessionName: string;
  setSessionName: (name: string) => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  isBreak: boolean;
  breakDuration: number;
  sessionDuration: number;
  isRunning: boolean;
  canStartSession: boolean;
  todaySessions: number;
  maxFreeSessions: number;
  pauseTimer: () => void;
  startTimer: () => void;
  resetTimer: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  sessionName,
  setSessionName,
  timeLeft,
  formatTime,
  isBreak,
  breakDuration,
  sessionDuration,
  isRunning,
  canStartSession,
  todaySessions,
  maxFreeSessions,
  pauseTimer,
  startTimer,
  resetTimer,
}) => (
  <div className="flex flex-col gap-6">
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
  </div>
);

export default SessionTimer;
