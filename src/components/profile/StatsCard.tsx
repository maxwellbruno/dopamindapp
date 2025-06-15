
import React from 'react';

interface Stats {
  totalFocusMinutes: number;
  currentStreak: number;
  moodEntries: number;
}

interface Session {
  duration: number;
}

interface StatsCardProps {
  stats: Stats;
  sessions: Session[];
  dailyFocusGoal: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, sessions, dailyFocusGoal }) => {
  const totalHours = Math.floor(stats.totalFocusMinutes / 60);
  const totalMinutes = stats.totalFocusMinutes % 60;
  const averageSessionLength = sessions.length > 0 
    ? Math.round(sessions.reduce((sum: number, session: any) => sum + session.duration, 0) / sessions.length)
    : 0;

  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Your Journey</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-mint-green to-mint-green bg-clip-text text-transparent">
            {totalHours}h {totalMinutes}m
          </div>
          <div className="text-sm text-text-light">Total Focus Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-deep-blue to-mint-green bg-clip-text text-transparent">{stats.currentStreak}</div>
          <div className="text-sm text-text-light">Current Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-mint-green to-mint-green bg-clip-text text-transparent">{sessions.length}</div>
          <div className="text-sm text-text-light">Sessions Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-deep-blue to-mint-green bg-clip-text text-transparent">{averageSessionLength}m</div>
          <div className="text-sm text-text-light">Avg Session</div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl p-4">
        <div className="text-sm text-text-light mb-2">
          Daily Goal Progress: {dailyFocusGoal > 0 ? Math.min(100, Math.round((stats.totalFocusMinutes / dailyFocusGoal) * 100)) : 0}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-mint-green to-mint-green h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${dailyFocusGoal > 0 ? Math.min(100, (stats.totalFocusMinutes / dailyFocusGoal) * 100) : 0}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
