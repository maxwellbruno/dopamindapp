
import { useState } from 'react';

export const useBreathingExercise = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [selectedBreathingExercise, setSelectedBreathingExercise] = useState<string | null>(null);

  const startBreathingExercise = (exerciseType?: string) => {
    setSelectedBreathingExercise(exerciseType || 'basic');
    setIsBreathing(true);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    setSelectedBreathingExercise(null);
  };

  return {
    isBreathing,
    selectedBreathingExercise,
    startBreathingExercise,
    stopBreathingExercise,
  };
};
