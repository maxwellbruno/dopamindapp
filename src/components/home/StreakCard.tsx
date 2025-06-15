
import React from 'react';

interface StreakCardProps {
  streak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-dark mb-1">Current Streak</h3>
          <div className="text-3xl font-bold text-warm-orange">
            {streak} days
          </div>
          <p className="text-sm text-text-light mt-1">Keep up the momentum!</p>
        </div>
        <div className="text-4xl animate-gentle-pulse">🔥</div>
      </div>
    </div>
  );
};

export default StreakCard;
