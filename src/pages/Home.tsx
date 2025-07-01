
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import PricingModal from '../components/PricingModal';
import AiChat from '../components/AiChat';
import MindfulAd from '../components/MindfulAd';
import HomeHeader from '../components/home/HomeHeader';
import StatsGrid from '../components/home/StatsGrid';
import StreakCard from '../components/home/StreakCard';
import AIChatCard from '../components/home/AIChatCard';
import DailyInsightCard from '../components/home/DailyInsightCard';
import QuickActions from '../components/home/QuickActions';
import PremiumFeatures from '../components/home/PremiumFeatures';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { isPremium, isElite, tier, createSubscription, isCreatingSubscription } = useSubscription();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showPricingFromChat, setShowPricingFromChat] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current data from localStorage
  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');
  const moods = JSON.parse(localStorage.getItem('dopamind_moods') || '[]');
  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
  
  // Calculate today's focus time from sessions
  const today = new Date().toDateString();
  const todaySessions = sessions.filter((session: any) => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today;
  });
  
  const todayFocusMinutes = todaySessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
  const totalHours = Math.floor(todayFocusMinutes / 60);
  const totalMinutes = todayFocusMinutes % 60;
  
  // Calculate current streak from sessions
  const calculateCurrentStreak = () => {
    if (sessions.length === 0) return 0;
    
    const sessionDates = [...new Set(sessions.map((session: any) => new Date(session.date).toDateString()))];
    sessionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = new Date(sessionDates[i]);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        streak = 1;
      } else if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateCurrentStreak();
  const todaySessionsCount = todaySessions.length;

  // Calculate average mood from mood entries
  const averageMood = moods.length > 0 
    ? moods.reduce((sum: number, mood: any) => sum + mood.value, 0) / moods.length 
    : 0;

  const getMoodLabel = (value: number) => {
    if (moods.length === 0) return 'No entries yet';
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

  const handleChatClick = () => {
    if (!isPremium) {
      setShowChatPrompt(true);
    } else {
      setShowAiChat(true);
    }
  };

  const handleUpgradeFromChat = () => {
    setShowChatPrompt(false);
    setShowPricingFromChat(true);
  };

  const handleUpgrade = async (selectedTier: 'pro' | 'elite') => {
    try {
      const result = await createSubscription({ planId: selectedTier });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
    setShowPricingFromChat(false);
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
            tier={tier}
          />
          
          <StatsGrid 
            totalHours={totalHours}
            totalMinutes={totalMinutes}
            todaySessions={todaySessionsCount}
            averageMoodLabel={getMoodLabel(averageMood)}
            moodsCount={moods.length}
          />

          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div>
              <StreakCard streak={currentStreak} />
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
              <PremiumFeatures isElite={isElite} />
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
                    <button 
                      onClick={handleUpgradeFromChat}
                      disabled={isCreatingSubscription}
                      className="w-full bg-mint-green text-white font-semibold rounded-2xl py-3 hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isCreatingSubscription ? 'Processing...' : 'Upgrade to Pro'}
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

          {/* Pricing Modal for Chat Upgrade */}
          <PricingModal 
            isOpen={showPricingFromChat}
            onClose={() => setShowPricingFromChat(false)}
            onUpgrade={handleUpgrade}
            currentTier={tier}
          />
          
          {showAiChat && <AiChat onClose={() => setShowAiChat(false)} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
