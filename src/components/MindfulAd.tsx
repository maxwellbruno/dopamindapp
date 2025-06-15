
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const MindfulAd: React.FC = () => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-warm-orange to-yellow-300 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="text-white" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-text-dark">Mindful Moments Tea</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Ad</span>
          </div>
          <p className="text-text-light text-sm leading-relaxed mb-4">
            Find your calm with our organic herbal tea blends. Perfect for your relaxation rituals.
          </p>
          <Button
            variant="outline"
            className="border-mint-green text-mint-green hover:bg-mint-green/10 hover:text-mint-green"
          >
            Discover More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MindfulAd;
