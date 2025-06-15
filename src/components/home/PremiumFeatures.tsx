
import React from 'react';

interface PremiumFeaturesProps {
  isElite: boolean;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ isElite }) => {
  return (
    <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Premium Features</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-light-gray rounded-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-mint-green to-mint-green rounded-full flex items-center justify-center">
            <span className="text-sm text-white">📊</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-dark">Advanced Analytics</p>
            <p className="text-xs text-text-light">View detailed focus and mood patterns</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-light-gray rounded-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
            <span className="text-sm text-white">🎵</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-dark">Premium Soundscapes</p>
            <p className="text-xs text-text-light">50+ ambient tracks for deep focus</p>
          </div>
        </div>

        {isElite && (
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-warm-orange/10 to-mint-green/10 rounded-2xl border border-warm-orange/20">
            <div className="w-8 h-8 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
              <span className="text-sm text-white">📈</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Weekly Wellness Reports</p>
              <p className="text-xs text-text-light">Personalized summaries of your progress</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumFeatures;
