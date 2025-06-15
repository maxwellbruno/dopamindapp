import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import AiChat from '../components/AiChat';
import MindfulAd from '../components/MindfulAd';
import HomeHeader from '../components/home/HomeHeader';
import StatsGrid from '../components/home/StatsGrid';
import StreakCard from '../components/home/StreakCard';
import AIChatCard from '../components/home/AIChatCard';
import DailyInsightCard from '../components/home/DailyInsightCard';
import QuickActions from '../components/home/QuickActions';
import PremiumFeatures from '../components/home/PremiumFeatures';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');
  const moods = JSON.parse(localStorage.getItem('dopamind_moods') || '[]');

  const totalHours = Math.floor(stats.totalFocusMinutes / 60);
  const totalMinutes = stats.totalFocusMinutes % 60;
  const todaySessions = sessions.filter((session: any) => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const averageMood = moods.length > 0 
    ? moods.reduce((sum: number, mood: any) => sum + mood.value, 0) / moods.length 
    : 0;

  const getMoodLabel = (value: number) => {
    if (value >= 4) return 'Great';
    if (value >= 3) return 'Good';
    if (value >= 2) return 'Okay';
    return 'Needs Attention';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const productivityTips = [
    "Focus on one task at a time to maximize efficiency and reduce mental fatigue.",
    "Take regular breaks to maintain peak cognitive performance throughout the day.",
    "Set clear intentions before each work session to stay aligned with your goals.",
    "Practice the 2-minute rule: if something takes less than 2 minutes, do it now.",
    "Create a distraction-free environment to enter deep work states more easily."
  ];

  const [dailyTip] = useState(() => {
    const tipIndex = new Date().getDate() % productivityTips.length;
    return productivityTips[tipIndex];
  });

  const isPremium = subscription.isPro || subscription.isElite;

  const handleChatClick = () => {
    if (!isPremium) {
      setShowChatPrompt(true);
    } else {
      setShowAiChat(true);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-8 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          <HomeHeader
            greeting={getGreeting()}
            userName={user?.name?.split(' ')[0] || ''}
            currentDate={currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
            isPremium={isPremium}
            tier={subscription.tier}
          />
          
          <StatsGrid 
            totalHours={totalHours}
            totalMinutes={totalMinutes}
            todaySessions={todaySessions}
            averageMoodLabel={getMoodLabel(averageMood)}
            moodsCount={moods.length}
          />

          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div>
              <StreakCard streak={stats.currentStreak} />
              <DailyInsightCard dailyTip={dailyTip} />
              {!isPremium && <MindfulAd />}
            </div>
            <div>
              <AIChatCard isPremium={isPremium} onChatClick={handleChatClick} />
              <QuickActions />
            </div>
          </div>

          {!isPremium ? (
            <div className="animate-fade-in-up mt-6" style={{ animationDelay: '0.6s' }}>
              <PremiumUpgradePrompt 
                feature="Unlock Advanced Analytics"
                description="Get detailed insights into your focus patterns and mood trends with AI-powered recommendations."
                tier="pro"
              />
            </div>
          ) : (
            <div className="mt-6">
              <PremiumFeatures isElite={subscription.isElite} />
            </div>
          )}

          {/* Chat Upgrade Prompt Modal */}
          {showChatPrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-2">Mindfulnest AI Chat</h3>
                  <p className="text-text-light text-sm mb-4">Access your personal wellness AI assistant with Dopamind Pro</p>
                  <div className="space-y-3">
                    <button className="w-full bg-mint-green text-white font-semibold rounded-2xl py-3 hover:scale-[1.02] transition-transform">
                      Upgrade to Pro
                    </button>
                    <button 
                      onClick={() => setShowChatPrompt(false)}
                      className="w-full text-text-light font-medium"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showAiChat && <AiChat onClose={() => setShowAiChat(false)} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
