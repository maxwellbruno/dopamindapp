
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserSettings } from '../types/settings';
import UserInfo from '../components/profile/UserInfo';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import StatsCard from '../components/profile/StatsCard';
import SettingsCard from '../components/profile/SettingsCard';
import WalletCard from '../components/profile/WalletCard';
import RewardsCard from '../components/profile/RewardsCard';
import SendCryptoModal from '../components/wallet/SendCryptoModal';
import BuyCryptoModal from '../components/wallet/BuyCryptoModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useWallet } from '@/hooks/useWallet';
import { useRewards } from '@/hooks/useRewards';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { tier } = useSubscription();
  const { wallet, balances, isLoading: walletLoading, connectWallet, isConnected } = useWallet();
  const { taskStreaks, pendingRewards, totalDopamineEarned, claimReward, isLoading: rewardsLoading } = useRewards();
  const [settings, setSettings] = useLocalStorage<UserSettings>('dopamind_settings', {
    dailyFocusGoal: 120,
    reminderTime: '09:00',
    theme: 'light',
    customAffirmation: 'I am focused and productive'
  });

  // Modal states
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

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

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  const handleSendCrypto = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSendModalOpen(true);
  };

  const handleBuyCrypto = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setBuyModalOpen(true);
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
      toast.success('Reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim reward');
      console.error('Claim reward error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-text-dark mb-6 text-center animate-fade-in-up">Profile</h1>

          {/* Desktop layout: User/Subscription/Wallet > Stats/Settings/Rewards */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col gap-6">
              <UserInfo subscriptionTier={tier} />
              <SubscriptionCard />
              <WalletCard
                walletAddress={wallet?.address}
                ethBalance={balances.eth}
                usdcBalance={balances.usdc}
                dopamineBalance={balances.dopamine}
                onConnect={handleWalletConnect}
                onSend={handleSendCrypto}
                onBuy={handleBuyCrypto}
                isConnected={isConnected}
              />
            </div>
            <div className="flex flex-col gap-6">
              <StatsCard stats={stats} sessions={sessions} dailyFocusGoal={settings.dailyFocusGoal} />
              <RewardsCard
                taskStreaks={taskStreaks}
                pendingRewards={pendingRewards}
                totalDopamineEarned={totalDopamineEarned}
                onClaimReward={handleClaimReward}
              />
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

      {/* Wallet Modals */}
      <SendCryptoModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        walletAddress={wallet?.address}
        ethBalance={balances.eth}
        usdcBalance={balances.usdc}
        dopamineBalance={balances.dopamine}
      />
      
      <BuyCryptoModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        walletAddress={wallet?.address}
      />
    </div>
  );
};

export default Profile;
