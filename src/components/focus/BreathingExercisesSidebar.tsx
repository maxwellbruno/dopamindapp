
import React from 'react';
import { Button } from '@/components/ui/button';

interface BreathingExercisesSidebarProps {
  availableBreathingExercises: any[];
  startBreathingExercise: (exerciseType: string) => void;
  isPremium: boolean;
  breathingExercises: any[];
}

const BreathingExercisesSidebar: React.FC<BreathingExercisesSidebarProps> = ({
  availableBreathingExercises,
  startBreathingExercise,
  isPremium,
  breathingExercises,
}) => (
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
);

export default BreathingExercisesSidebar;
