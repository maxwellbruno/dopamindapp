import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PricingModal from '../components/PricingModal';
import SubscriptionManager from '../components/SubscriptionManager';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  
  const [showPricing, setShowPricing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [affirmation, setAffirmation] = useLocalStorage('dopamind_affirmation', '');
  const [tempAffirmation, setTempAffirmation] = useState(affirmation);

  const handleUpgrade = (selectedTier: 'free' | 'pro' | 'elite') => {
    if (selectedTier === 'free') {
      setSubscription({
        isPro: false,
        isElite: false,
        subscriptionEnd: null,
        tier: 'free'
      });
    } else {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      setSubscription({
        isPro: selectedTier === 'pro' || selectedTier === 'elite',
        isElite: selectedTier === 'elite',
        subscriptionEnd: endDate.toISOString(),
        tier: selectedTier
      });
    }
    setShowPricing(false);
  };

  const handleSaveAffirmation = () => {
    setAffirmation(tempAffirmation);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setTempAffirmation(affirmation);
    setShowSettings(false);
  };

  const getSubscriptionDisplay = () => {
    if (subscription.tier === 'free') return 'Free Plan';
    if (subscription.tier === 'pro') return 'Pro Plan';
    if (subscription.tier === 'elite') return 'Elite Plan';
    return 'Free Plan';
  };

  const getSubscriptionColor = () => {
    if (subscription.tier === 'elite') return 'from-warm-orange to-mint-green';
    if (subscription.tier === 'pro') return 'from-mint-green to-mint-green';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-deep-blue text-center mb-8 animate-fade-in-up">Profile</h1>
          
          {/* User Info Card */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-mint-green rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">{user?.name?.charAt(0) || '👤'}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-deep-blue">{user?.name || 'User'}</h2>
                <p className="text-text-light">{user?.email}</p>
              </div>
            </div>
            
            {/* Subscription Status */}
            <div className="mb-4">
              <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getSubscriptionColor()}`}>
                {subscription.tier === 'elite' && '👑 '}
                {subscription.tier === 'pro' && '🧠 '}
                {getSubscriptionDisplay()}
              </div>
              {subscription.subscriptionEnd && (
                <p className="text-xs text-text-light mt-2">
                  Expires: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Subscription Management */}
            <div className="space-y-3">
              {subscription.tier !== 'free' ? (
                <SubscriptionManager />
              ) : (
                <Button 
                  onClick={() => setShowPricing(true)}
                  className="w-full bg-mint-green hover:bg-mint-green/90 text-white font-semibold rounded-2xl h-12"
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-deep-blue mb-4">Your Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-green mb-1">
                  {JSON.parse(localStorage.getItem('dopamind_stats') || '{"currentStreak": 0}').currentStreak}
                </div>
                <div className="text-sm text-text-light">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warm-orange mb-1">
                  {Math.floor(JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0}').totalFocusMinutes / 60)}h
                </div>
                <div className="text-sm text-text-light">Total Focus</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-deep-blue">Settings</h3>
              <Button 
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="text-mint-green border-mint-green hover:bg-mint-green hover:text-white"
              >
                {showSettings ? 'Hide' : 'Edit'}
              </Button>
            </div>
            
            {showSettings ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="affirmation" className="text-sm font-semibold text-deep-blue mb-2 block">
                    Personal Affirmation
                  </Label>
                  <Textarea
                    id="affirmation"
                    value={tempAffirmation}
                    onChange={(e) => setTempAffirmation(e.target.value)}
                    placeholder="Enter your daily affirmation..."
                    rows={3}
                    className="w-full bg-white border-gray-300 text-deep-blue placeholder-cool-gray rounded-xl"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSaveAffirmation}
                    className="flex-1 bg-mint-green hover:bg-mint-green/90 text-white rounded-xl"
                  >
                    Save
                  </Button>
                  <Button 
                    onClick={handleCancelSettings}
                    variant="outline"
                    className="flex-1 border-mint-green text-mint-green hover:bg-mint-green hover:text-white rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-deep-blue">
                <p className="text-sm mb-2 font-medium">Daily Affirmation:</p>
                <p className="text-sm italic">
                  {affirmation || "Set your personal affirmation to stay motivated"}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              onClick={signOut}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl h-12 font-semibold"
            >
              Sign Out
            </Button>
          </div>

          {/* Pricing Modal */}
          <PricingModal 
            isOpen={showPricing}
            onClose={() => setShowPricing(false)}
            onUpgrade={handleUpgrade}
            currentTier={subscription.tier}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
