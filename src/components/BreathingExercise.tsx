
import React, { useState, useEffect, useRef } from 'react';
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

const WIM_INHALE_PHASE = { name: 'Inhale', duration: 1.5, color: 'bg-mint-green', scale: 1.3 };
const WIM_EXHALE_PHASE = { name: 'Exhale', duration: 1.5, color: 'bg-deep-blue', scale: 1 };
const WIM_HOLD_PHASE = { name: 'Hold after exhale', duration: 30, color: 'bg-warm-orange', scale: 1 };
const WIM_RECOVERY_PHASE = { name: 'Recovery Breath', duration: 15, color: 'bg-mint-green', scale: 1.3 };

const WIM_TOTAL_ROUNDS = 30; // # of inhale-exhale before hold

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ exerciseType, onStop }) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

  // Wim Hof only:
  const [wimRound, setWimRound] = useState(1);
  const [wimPhase, setWimPhase] = useState<'inhale' | 'exhale' | 'hold' | 'recovery'>('inhale');
  const [inWim, setInWim] = useState(false);

  // Generate phases for non-WIM exercises
  const getExercisePhases = (type: string): BreathingPhase[] => {
    switch (type) {
      case 'basic':
        return [ // 4-7-8 Breathing
          { name: 'Breathe In', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 7, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Breathe Out', duration: 8, color: 'bg-deep-blue', scale: 1 }
        ];
      case 'box':
        return [
          { name: 'Breathe In', duration: 4, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1.3 },
          { name: 'Breathe Out', duration: 4, color: 'bg-deep-blue', scale: 1 },
          { name: 'Hold', duration: 4, color: 'bg-cool-gray', scale: 1 }
        ];
      case 'coherent':
        return [
          { name: 'Breathe In', duration: 5.5, color: 'bg-mint-green', scale: 1.3 },
          { name: 'Breathe Out', duration: 5.5, color: 'bg-deep-blue', scale: 1 }
        ];
      case 'alternate':
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

  // WIM stateful phase logic
  const getWimPhase = () => {
    if (wimPhase === 'inhale') {
      return {
        ...WIM_INHALE_PHASE,
        name: `Inhale [${wimRound}/${WIM_TOTAL_ROUNDS}]`
      };
    }
    if (wimPhase === 'exhale') {
      return {
        ...WIM_EXHALE_PHASE,
        name: `Exhale [${wimRound}/${WIM_TOTAL_ROUNDS}]`
      };
    }
    if (wimPhase === 'hold') {
      return {
        ...WIM_HOLD_PHASE,
        scale: 1, // DEFLATED ORANGE
        name: 'Hold after exhale'
      };
    }
    if (wimPhase === 'recovery') {
      return {
        ...WIM_RECOVERY_PHASE,
        color: 'bg-warm-orange', // Recovery breath is orange/inflated
        name: 'Recovery Breath (hold 15s)'
      };
    }
    // fallback
    return WIM_INHALE_PHASE;
  };

  const phases = exerciseType === 'wim' ? [] : getExercisePhases(exerciseType);
  const currentPhase = exerciseType === 'wim'
    ? getWimPhase()
    : phases[currentPhaseIndex];

  // Sync for WIM mode: initialize state on mode enter
  useEffect(() => {
    if (exerciseType === 'wim') {
      setInWim(true);
      setWimRound(1);
      setWimPhase('inhale');
      setTimer(0);
      setIsActive(true);
      setCycleCount(0);
    } else {
      setInWim(false);
    }
  }, [exerciseType]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isActive) {
      if (interval) clearInterval(interval);
      return;
    }

    // --- WIM HOF ---

    if (exerciseType === 'wim' && inWim) {
      interval = setInterval(() => {
        setTimer(prev => prev + 0.1); // 100ms steps
      }, 100);

      // Timer logic for phase-ending
      if (
        (wimPhase === 'inhale' && timer >= WIM_INHALE_PHASE.duration) ||
        (wimPhase === 'exhale' && timer >= WIM_EXHALE_PHASE.duration) ||
        (wimPhase === 'hold' && timer >= WIM_HOLD_PHASE.duration) ||
        (wimPhase === 'recovery' && timer >= WIM_RECOVERY_PHASE.duration)
      ) {
        setTimer(0);
        setTimeout(() => {
          // PHASE SWITCH LOGIC
          if (wimPhase === 'inhale') {
            setWimPhase('exhale');
          } else if (wimPhase === 'exhale') {
            if (wimRound < WIM_TOTAL_ROUNDS) {
              setWimRound(wimRound + 1);
              setWimPhase('inhale');
            } else {
              setWimPhase('hold');
              setWimRound(1);
            }
          } else if (wimPhase === 'hold') {
            setWimPhase('recovery');
          } else if (wimPhase === 'recovery') {
            setWimPhase('inhale');
            setWimRound(1);
            setCycleCount(prev => prev + 1); // Next cycle
          }
        }, 10);
      }
    } else {
      // --- All non-WIM ---
      if (timer < currentPhase.duration) {
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
    }

    return () => { if (interval) clearInterval(interval); };
    // eslint-disable-next-line
  }, [isActive, timer, wimPhase, wimRound, inWim, exerciseType, currentPhaseIndex, phases.length, currentPhase?.duration]);

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

  const progressPercentage =
    exerciseType === 'wim' && inWim
      ? (timer / (currentPhase?.duration || 1)) * 100
      : (timer / (currentPhase?.duration || 1)) * 100;

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
            transition: 'transform 1s cubic-bezier(0.4,0,0.2,1), background-color 0.5s ease-in-out'
          }}
        >
          {exerciseType === 'wim' && inWim
            ? Math.ceil((currentPhase.duration - timer) > 0 ? (currentPhase.duration - timer) : 0)
            : Math.ceil((currentPhase.duration - timer) > 0 ? (currentPhase.duration - timer) : 0)
          }
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
          {Math.ceil((currentPhase.duration - timer) > 0 ? (currentPhase.duration - timer) : 0)} seconds remaining
        </p>
        {exerciseType === 'wim' && inWim && wimPhase !== 'hold' && wimPhase !== 'recovery' && (
          <p className="text-xs text-mint-green mt-2">
            {(wimPhase === 'inhale' || wimPhase === 'exhale') && `Power Breathing: Breath ${wimRound} of ${WIM_TOTAL_ROUNDS}`}
          </p>
        )}
        {exerciseType === 'wim' && inWim && wimPhase === 'hold' && (
          <p className="text-xs text-warm-orange mt-2">
            Hold: After final exhalation, hold your breath as long as comfortable.
          </p>
        )}
        {exerciseType === 'wim' && inWim && wimPhase === 'recovery' && (
          <p className="text-xs text-warm-orange mt-2">
            Recovery Breath: Inhale fully and hold for 15 seconds.
          </p>
        )}
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
            border-deep-blue text-deep-blue
            outline-none ring-0
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
          {exerciseType === 'wim' && (
            <>
              Take {WIM_TOTAL_ROUNDS} quick deep breaths, then hold after exhale. <br />
              1. Belly Inhale (mint green, inflate) <br />
              2. Natural Exhale (deep blue, deflate) <br />
              3. After exhale: Hold breath (orange, deflated) <br />
              4. Recovery Breath: Inhale, hold 15s (orange, inflated)
            </>
          )}
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
