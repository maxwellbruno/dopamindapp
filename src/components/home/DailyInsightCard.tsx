
import React from 'react';

interface DailyInsightCardProps {
  dailyTip: string;
}

const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ dailyTip }) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-dark mb-2">Daily Insight</h3>
          <p className="text-text-light text-sm leading-relaxed">{dailyTip}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyInsightCard;
