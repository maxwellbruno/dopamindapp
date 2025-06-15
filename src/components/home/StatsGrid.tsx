
import React from 'react';

interface StatsGridProps {
  totalHours: number;
  totalMinutes: number;
  todaySessions: number;
  averageMoodLabel: string;
  moodsCount: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ totalHours, totalMinutes, todaySessions, averageMoodLabel, moodsCount }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="dopamind-card p-4 animate-fade-in-up">
        <h3 className="text-sm font-semibold text-text-light mb-2">Daily Focus</h3>
        <div className="text-2xl font-bold text-mint-green">
          {totalHours}h {totalMinutes}m
        </div>
        <div className="text-xs text-text-light mt-1">{todaySessions} sessions today</div>
      </div>

      <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-semibold text-text-light mb-2">Mood Summary</h3>
        <div className="text-2xl font-bold text-warm-orange">
          {averageMoodLabel}
        </div>
        <div className="text-xs text-text-light mt-1">{moodsCount} entries</div>
      </div>
    </div>
  );
};

export default StatsGrid;
