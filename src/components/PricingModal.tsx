
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'pro' | 'elite') => void;
  currentTier?: 'free' | 'pro' | 'elite';
}

const PricingModal: React.FC<PricingModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  currentTier = 'free' 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-0 rounded-3xl max-w-md neuro-shadow">
        <DialogHeader>
          <DialogTitle className="text-center text-midnight-slate text-xl font-bold">
            Unlock Your Full Potential
          </DialogTitle>
          <p className="text-center text-slate-600 mt-2">
            Choose the plan that fits your wellness journey
          </p>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {/* Pro Plan */}
          <div className={`border-2 rounded-3xl p-6 relative transition-all duration-300 ${
            currentTier === 'pro' 
              ? 'border-serenity-blue bg-gradient-to-br from-serenity-blue/10 to-mindful-mint/10' 
              : 'border-serenity-blue hover:shadow-lg'
          }`}>
            {currentTier !== 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-serenity-blue to-mindful-mint text-white px-4 py-1 rounded-full text-sm font-semibold neuro-shadow">
                  Most Popular
                </span>
              </div>
            )}
            {currentTier === 'pro' && (
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-tranquil-green to-mindful-mint text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Current Plan
                </span>
              </div>
            )}
            
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🧠</span>
              <h4 className="text-lg font-bold text-midnight-slate">Dopamind Pro</h4>
            </div>
            
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent">$4.99</span>
              <span className="text-slate-600 ml-1">/month</span>
            </div>
            
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Unlimited focus sessions
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Advanced mood analytics
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Premium soundscapes (50+ tracks)
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Custom session durations (5min - 4 hours)
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                365-day streak tracking
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                8 premium dark mode themes
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Offline mode support
              </li>
            </ul>
            
            {currentTier !== 'pro' ? (
              <Button 
                onClick={() => onUpgrade('pro')}
                className="w-full bg-gradient-to-r from-serenity-blue to-mindful-mint text-white font-semibold rounded-2xl h-12 neuro-shadow hover:scale-[1.02] transition-transform"
              >
                Start 7-Day Free Trial
              </Button>
            ) : (
              <Button 
                disabled
                className="w-full bg-gray-200 text-gray-500 font-semibold rounded-2xl h-12"
              >
                Current Plan
              </Button>
            )}
          </div>

          {/* Elite Plan */}
          <div className={`border-2 rounded-3xl p-6 relative transition-all duration-300 ${
            currentTier === 'elite' 
              ? 'border-lavender-haze bg-gradient-to-br from-lavender-haze/10 to-mindful-mint/10' 
              : 'border-lavender-haze hover:shadow-lg'
          }`}>
            {currentTier === 'elite' && (
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-tranquil-green to-mindful-mint text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Current Plan
                </span>
              </div>
            )}
            
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">👑</span>
              <h4 className="text-lg font-bold text-midnight-slate">Dopamind Elite</h4>
            </div>
            
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-lavender-haze to-mindful-mint bg-clip-text text-transparent">$9.99</span>
              <span className="text-slate-600 ml-1">/month</span>
            </div>
            
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                <strong>Everything in Pro</strong>
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                1-on-1 Virtual Coaching (monthly)
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                AI-powered custom programs
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Family Sharing (up to 6 accounts)
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Priority feature requests
              </li>
              <li className="flex items-center">
                <span className="text-tranquil-green mr-2">✓</span>
                Advanced integration hub
              </li>
            </ul>
            
            {currentTier !== 'elite' ? (
              <Button 
                onClick={() => onUpgrade('elite')}
                className="w-full bg-gradient-to-r from-lavender-haze to-mindful-mint text-white font-semibold rounded-2xl h-12 neuro-shadow hover:scale-[1.02] transition-transform"
              >
                {currentTier === 'pro' ? 'Upgrade to Elite' : 'Start 7-Day Free Trial'}
              </Button>
            ) : (
              <Button 
                disabled
                className="w-full bg-gray-200 text-gray-500 font-semibold rounded-2xl h-12"
              >
                Current Plan
              </Button>
            )}
          </div>
          
          <div className="text-center text-xs text-slate-500 mt-4">
            Cancel anytime. No questions asked.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
