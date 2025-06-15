
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserSettings } from '../types/settings';
import UserInfo from '../components/profile/UserInfo';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import StatsCard from '../components/profile/StatsCard';
import SettingsCard from '../components/profile/SettingsCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
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
  
  const { data: profileData } = useQuery({
    queryKey: ['profileStats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError) {
        console.error("Error fetching user stats", statsError);
        throw statsError;
      }

      const { data: sessions, error: sessionsError } = await supabase
        .from('focus_sessions')
        .select('duration')
        .eq('user_id', user.id);
      
      if (sessionsError) {
        console.error("Error fetching sessions", sessionsError);
        throw sessionsError;
      }

      // Mood entries are not part of this task, so we'll leave it as is for now.
      const moodEntries = JSON.parse(localStorage.getItem('dopamind_mood_entries') || '[]').length;

      return {
        stats: {
          totalFocusMinutes: stats?.total_focus_minutes || 0,
          currentStreak: stats?.current_streak || 0,
          moodEntries: moodEntries,
        },
        sessions: sessions || []
      };
    },
    enabled: !!user,
  });

  const stats = profileData?.stats || { totalFocusMinutes: 0, currentStreak: 0, moodEntries: 0 };
  const sessions = profileData?.sessions || [];

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-text-dark mb-6 text-center animate-fade-in-up">Profile</h1>

          {/* Desktop layout: User/Subscription > Stats/Settings */}
          <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-6">
              <UserInfo subscriptionTier={subscription.tier} />
              <SubscriptionCard subscription={subscription} setSubscription={setSubscription} />
            </div>
            <div className="flex flex-col gap-6">
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
      </div>
    </div>
  );
};

export default Profile;
