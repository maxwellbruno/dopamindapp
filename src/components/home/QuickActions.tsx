
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/focus')}
          className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-mint-green hover:bg-mint-green/5 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="text-xl">🎯</span>
          </div>
          <span className="font-medium text-text-dark">Focus</span>
          <span className="text-xs text-text-light">Start a session</span>
        </button>

        <button 
          onClick={() => navigate('/mood')}
          className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-mint-green hover:bg-mint-green/5 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="text-xl">😊</span>
          </div>
          <span className="font-medium text-text-dark">Mood</span>
          <span className="text-xs text-text-light">Track feelings</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
