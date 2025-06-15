
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionStatsSidebarProps {
  totalSessions: number;
  currentStreak: number;
  isPremium: boolean;
  isLoading: boolean;
}

const SessionStatsSidebar: React.FC<SessionStatsSidebarProps> = ({
  totalSessions, currentStreak, isPremium, isLoading
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-lg font-semibold text-text-dark mb-4">Session Stats</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
          </div>
          {isPremium && (
            <Skeleton className="h-10 w-[88px] rounded-md" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dopamind-card p-6 animate-fade-in-up md:h-full" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Session Stats</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <div className="text-lg font-bold text-text-dark">Total Sessions: {totalSessions}</div>
              <div className="text-sm text-text-light">Current Streak: {currentStreak} days</div>
            </div>
          </div>
        </div>
        {isPremium && (
          <Button onClick={() => navigate('/focus/all')}>View All</Button>
        )}
      </div>
    </div>
  )
};

export default SessionStatsSidebar;
