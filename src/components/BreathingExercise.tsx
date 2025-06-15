import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BreathingExerciseProps {
  exerciseType: string;
  onStop: () => void;
}

interface BreathingPhase {
  name: string;
  duration: number;
  color: string;
  scale: number;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ exerciseType, onStop }) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

  const getExercisePhases = (type: string): BreathingPhase[] => {
    switch (type) {
      case 'basic': // 4-7-8 Breathing
        return [
          { name: 'Breathe In', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 7, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Breathe Out', duration: 8, color: 'bg-deep-blue', scale: 1 }
        ];
      case 'box': // Box Breathing
        return [
          { name: 'Breathe In', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Breathe Out', duration: 4, color: 'bg-deep-blue', scale: 1 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1 }
        ];
      case 'coherent': // Coherent Breathing
        return [
          { name: 'Breathe In', duration: 5.5, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Breathe Out', duration: 5.5, color: 'bg-deep-blue', scale: 1 }
        ];
      case 'wim': // Wim Hof Method (simplified)
        return [
          { name: 'Deep Breath In', duration: 1, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Quick Out', duration: 1, color: 'bg-deep-blue', scale: 1 },
          { name: 'Hold after 30 breaths', duration: 30, color: 'bg-cool-gray', scale: 1 },
          { name: 'Recovery Breath', duration: 15, color: 'bg-mint-green', scale: 1.3 }
        ];
      case 'alternate': // Alternate Nostril
        return [
          { name: 'Inhale (Left)', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Exhale (Right)', duration: 4, color: 'bg-deep-blue', scale: 1 },
          { name: 'Inhale (Right)', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Exhale (Left)', duration: 4, color: 'bg-deep-blue', scale: 1 }
        ];
      default:
        return [
          { name: 'Breathe In', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Breathe Out', duration: 4, color: 'bg-deep-blue', scale: 1 }
        ];
    }
  };

  const phases = getExercisePhases(exerciseType);
  const currentPhase = phases[currentPhaseIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timer < currentPhase.duration) {
      interval = setInterval(() => {
        setTimer(prev => prev + 0.1);
      }, 100);
    } else if (timer >= currentPhase.duration) {
      // Move to next phase
      const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      setCurrentPhaseIndex(nextPhaseIndex);
      setTimer(0);
      
      if (nextPhaseIndex === 0) {
        setCycleCount(prev => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timer, currentPhase.duration, currentPhaseIndex, phases.length]);

  const getExerciseName = (type: string): string => {
    switch (type) {
      case 'basic': return '4-7-8 Breathing';
      case 'box': return 'Box Breathing';
      case 'coherent': return 'Coherent Breathing';
      case 'wim': return 'Wim Hof Method';
      case 'alternate': return 'Alternate Nostril';
      default: return 'Breathing Exercise';
    }
  };

  const progressPercentage = (timer / currentPhase.duration) * 100;

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-deep-blue mb-2">{getExerciseName(exerciseType)}</h3>
      <p className="text-sm text-text-light mb-6">Cycle {cycleCount + 1}</p>

      {/* Breathing Circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div 
          className={`w-full h-full rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center text-white font-bold text-lg shadow-lg ${currentPhase.color}`}
          style={{ 
            transform: `scale(${currentPhase.scale})`,
            transition: 'transform 1s ease-in-out, background-color 0.5s ease-in-out'
          }}
        >
          {Math.ceil(currentPhase.duration - timer)}
        </div>
        
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
            className="transition-all duration-100"
          />
        </svg>
      </div>

      {/* Phase Information */}
      <div className="mb-6">
        <p className="text-2xl font-bold text-deep-blue mb-2">{currentPhase.name}</p>
        <p className="text-sm text-text-light">
          {Math.ceil(currentPhase.duration - timer)} seconds remaining
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <Button 
          onClick={() => setIsActive(!isActive)}
          className="bg-mint-green hover:bg-mint-green/90 text-white rounded-2xl px-6 py-2 mr-3"
        >
          {isActive ? 'Pause' : 'Resume'}
        </Button>
        
        <Button 
          onClick={onStop}
          variant="outline"
          className="rounded-2xl border-deep-blue text-deep-blue bg-white hover:bg-deep-blue hover:text-white px-6 py-2 
            focus:bg-deep-blue focus:text-white
            active:bg-deep-blue active:text-white
            !border-deep-blue !text-deep-blue
            !outline-none !ring-0
            "
          style={{
            backgroundColor: "white",
            borderColor: "#1E3A8A",
            color: "#1E3A8A"
          }}
        >
          Stop
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-light-gray rounded-2xl">
        <p className="text-xs text-text-light">
          {exerciseType === 'wim' && 'Take 30 quick deep breaths, then hold after exhale'}
          {exerciseType === 'alternate' && 'Imagine breathing through different nostrils'}
          {exerciseType === 'coherent' && 'Maintain steady, rhythmic breathing'}
          {exerciseType === 'box' && 'Four equal phases create the "box" pattern'}
          {exerciseType === 'basic' && 'Classic relaxation technique for stress relief'}
        </p>
      </div>
    </div>
  );
};

export default BreathingExercise;
