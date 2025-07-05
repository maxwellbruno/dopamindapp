
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'pro' | 'elite') => void;
  currentTier: 'free' | 'pro' | 'elite';
}

const PricingModal: React.FC<PricingModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  currentTier 
}) => {
  const { isCreatingSubscription } = useSubscription();

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '₦7,500',
      period: '/month',
      description: 'Perfect for building healthy habits',
      features: [
        'Advanced mood analytics',
        'Custom focus sessions',
        'Progress tracking',
        'Breathing exercises',
        'Dopamind AI Chat Assistant',
        'Priority support'
      ],
      popular: true,
      gradient: 'from-mint-green to-mint-green'
    },
    {
      id: 'elite' as const,
      name: 'Elite',
      price: '₦15,000',
      period: '/month',
      description: 'For serious wellness enthusiasts',
      features: [
        'Everything in Pro',
        'Personalized recommendations',
        'Advanced meditation guides',
        'Weekly wellness reports',
        'Premium content library',
        'AI Soundscape Generation'
      ],
      popular: false,
      gradient: 'from-mint-green to-deep-blue'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-light-gray rounded-3xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-deep-blue rounded-t-3xl px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pure-white">Choose Your Plan</h2>
            <button 
              onClick={onClose}
              className="text-pure-white hover:text-mint-green text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-pure-white/80 text-sm mt-2">
            Unlock premium features and enhance your wellness journey
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all bg-white ${
                tier.popular 
                  ? 'border-mint-green bg-mint-green/5' 
                  : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="bg-mint-green text-white text-xs font-semibold px-3 py-1 text-center">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-mint-green mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-deep-blue">{tier.price}</span>
                    <span className="text-deep-blue ml-1">{tier.period}</span>
                  </div>
                  <p className="text-xs text-mint-green mb-2">✨ 7-day free trial included!</p>
                  <p className="text-deep-blue text-sm">{tier.description}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="w-5 h-5 bg-mint-green rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-deep-blue">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => onUpgrade(tier.id)}
                  disabled={currentTier === tier.id || isCreatingSubscription}
                  className={`w-full h-12 rounded-2xl font-semibold text-white transition-all ${
                    currentTier === tier.id
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-mint-green hover:bg-mint-green/90 hover:scale-[1.02] disabled:opacity-50'
                  }`}
                >
                  {isCreatingSubscription ? 'Processing...' : 
                   currentTier === tier.id ? 'Current Plan' : `Start Free Trial`}
                </Button>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-deep-blue text-sm mb-2">
              🔒 Secure payment • Cancel anytime
            </p>
            <p className="text-deep-blue text-xs">
              7-day free trial • No commitment required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
