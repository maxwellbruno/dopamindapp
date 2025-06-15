
import React from 'react';
import BreathingExercise from '../BreathingExercise';
import SessionTimer from './SessionTimer';
import SessionSettings from './SessionSettings';
import BreathingExercisesSidebar from './BreathingExercisesSidebar';
import AmbientSoundsSidebar from './AmbientSoundsSidebar';
import SessionStatsSidebar from './SessionStatsSidebar';

interface FocusLayoutProps {
  // Timer props
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
  
  // Settings props
  canCustomizeDuration: boolean;
  maxFreeSessionDuration: number;
  handleSessionDurationChange: (value: number) => void;
  setBreakDuration: (value: number) => void;
  
  // Sidebar props
  availableBreathingExercises: any[];
  startBreathingExercise: (exerciseType: string) => void;
  isPremium: boolean;
  breathingExercises: any[];
  availableSounds: any[];
  selectedSound: string | null;
  setSelectedSound: (id: string) => void;
  soundOptions: any[];
  totalSessions: number;
  currentStreak: number;
  isLoading: boolean;
  
  // Breathing exercise props
  isBreathing: boolean;
  selectedBreathingExercise: string | null;
  stopBreathingExercise: () => void;
}

const FocusLayout: React.FC<FocusLayoutProps> = ({
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
  canCustomizeDuration,
  maxFreeSessionDuration,
  handleSessionDurationChange,
  setBreakDuration,
  availableBreathingExercises,
  startBreathingExercise,
  isPremium,
  breathingExercises,
  availableSounds,
  selectedSound,
  setSelectedSound,
  soundOptions,
  totalSessions,
  currentStreak,
  isLoading,
  isBreathing,
  selectedBreathingExercise,
  stopBreathingExercise,
}) => {
  return (
    <>
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
            isPremium={isPremium}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modal/Overlay for Breathing Exercise */}
      {isBreathing && selectedBreathingExercise && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-deep-blue max-w-sm w-full p-6 rounded-2xl shadow-2xl relative animate-fade-in-up">
            <BreathingExercise
              exerciseType={selectedBreathingExercise}
              onStop={stopBreathingExercise}
            />
            {/* Close button, optional */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Close"
              onClick={stopBreathingExercise}
            >×</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FocusLayout;
