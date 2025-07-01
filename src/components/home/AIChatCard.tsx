
import React from 'react';

interface AIChatCardProps {
  isPremium: boolean;
  onChatClick: () => void;
}

const AIChatCard: React.FC<AIChatCardProps> = ({ isPremium, onChatClick }) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🤖</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-dark mb-1">Mindfulnest AI</h3>
          <p className="text-text-light text-sm">Chat with your personal wellness assistant</p>
        </div>
        <button 
          onClick={onChatClick}
          className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
            isPremium 
              ? 'bg-mint-green text-white hover:scale-105' 
              : 'bg-mint-green text-white'
          }`}
        >
          {isPremium ? 'Chat' : '🔒 Pro'}
        </button>
      </div>
    </div>
  );
};

export default AIChatCard;
