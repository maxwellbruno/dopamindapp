
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserSettings } from '../types/settings';
import UserInfo from '../components/profile/UserInfo';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import StatsCard from '../components/profile/StatsCard';
import SettingsCard from '../components/profile/SettingsCard';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const [settings, setSettings] = useLocalStorage<UserSettings>('dopamind_settings', {
    dailyFocusGoal: 120,
    reminderTime: '09:00',
    theme: 'light',
    customAffirmation: 'I am focused and productive'
  });
  
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  
  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-text-dark mb-6 text-center animate-fade-in-up">Profile</h1>

          <UserInfo subscriptionTier={subscription.tier} />

          <SubscriptionCard subscription={subscription} setSubscription={setSubscription} />
          
          <StatsCard stats={stats} sessions={sessions} dailyFocusGoal={settings.dailyFocusGoal} />

          <SettingsCard settings={settings} setSettings={setSettings} subscriptionTier={subscription.tier} />

          <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={logout}
              className="w-full bg-mint-green text-white hover:bg-mint-green/90 rounded-xl"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
