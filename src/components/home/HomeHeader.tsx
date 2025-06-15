
import React from 'react';

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  currentDate: string;
  isPremium: boolean;
  tier: 'free' | 'pro' | 'elite';
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ greeting, userName, currentDate, isPremium, tier }) => {
  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            {greeting}, {userName}
          </h1>
          <p className="text-text-light">
            {currentDate}
          </p>
        </div>
        
        {isPremium && (
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
              tier === 'elite'
                ? 'bg-gradient-to-r from-warm-orange to-mint-green' 
                : 'bg-gradient-to-r from-mint-green to-mint-green'
            }`}>
              {tier === 'elite' ? '👑 Elite' : '🧠 Pro'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;
