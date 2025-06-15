
import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link to="/focus">
        <div className="dopamind-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-xl text-white">🎯</span>
          </div>
          <h3 className="text-center font-semibold text-text-dark">Focus</h3>
          <p className="text-center text-xs text-text-light mt-1">Start a session</p>
        </div>
      </Link>

      <Link to="/mood">
        <div className="dopamind-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-warm-orange to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-xl text-white">😊</span>
          </div>
          <h3 className="text-center font-semibold text-text-dark">Mood</h3>
          <p className="text-center text-xs text-text-light mt-1">Track feelings</p>
        </div>
      </Link>
    </div>
  );
};

export default QuickActions;
