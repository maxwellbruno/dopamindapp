
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserSettings } from '../types/settings';
import UserInfo from '../components/profile/UserInfo';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import StatsCard from '../components/profile/StatsCard';
import SettingsCard from '../components/profile/SettingsCard';
import { Wallet as WalletIcon, Trophy, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [settings, setSettings] = useLocalStorage<UserSettings>('dopamind_settings', {
    dailyFocusGoal: 120,
    reminderTime: '09:00',
    theme: 'light',
    customAffirmation: 'I am focused and productive'
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const canUseDarkMode = tier === 'pro' || tier === 'elite';
    if (settings.theme === 'dark' && canUseDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme, tier]);

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

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col gap-6">
              <UserInfo subscriptionTier={tier} />
              <SubscriptionCard />

              {/* Wallet & Rewards quick links */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate('/wallet')}
                  className="dopamind-card p-4 flex items-center justify-between hover:bg-soft-gray transition-colors animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-mint-green/10 flex items-center justify-center">
                      <WalletIcon className="h-5 w-5 text-mint-green" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-text-dark">Wallet</p>
                      <p className="text-sm text-text-secondary">View balances & transact</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-secondary" />
                </button>

                <button
                  onClick={() => navigate('/rewards')}
                  className="dopamind-card p-4 flex items-center justify-between hover:bg-soft-gray transition-colors animate-fade-in-up"
                  style={{ animationDelay: '0.35s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-accent-gold" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-text-dark">Rewards</p>
                      <p className="text-sm text-text-secondary">Track streaks & claim DOPAMINE</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-secondary" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <StatsCard stats={stats} sessions={sessions} dailyFocusGoal={settings.dailyFocusGoal} />
              <SettingsCard settings={settings} setSettings={setSettings} subscriptionTier={tier} />
              <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
