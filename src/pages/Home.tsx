import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';

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
      // Navigate to chat - for now just show alert
      alert('Welcome to Mindfulnest! AI chat feature coming soon.');
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-text-dark">
                  {getGreeting()}, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-text-light">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Premium Badge */}
              {isPremium && (
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    subscription.isElite 
                      ? 'bg-gradient-to-r from-warm-orange to-mint-green' 
                      : 'bg-gradient-to-r from-mint-green to-mint-green'
                  }`}>
                    {subscription.isElite ? '👑 Elite' : '🧠 Pro'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="dopamind-card p-4 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-text-light mb-2">Daily Focus</h3>
              <div className="text-2xl font-bold text-mint-green">
                {totalHours}h {totalMinutes}m
              </div>
              <div className="text-xs text-text-light mt-1">{todaySessions} sessions today</div>
            </div>

            <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-sm font-semibold text-text-light mb-2">Mood Summary</h3>
              <div className="text-2xl font-bold text-warm-orange">
                {getMoodLabel(averageMood)}
              </div>
              <div className="text-xs text-text-light mt-1">{moods.length} entries</div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-1">Current Streak</h3>
                <div className="text-3xl font-bold text-warm-orange">
                  {stats.currentStreak} days
                </div>
                <p className="text-sm text-text-light mt-1">Keep up the momentum!</p>
              </div>
              <div className="text-4xl animate-gentle-pulse">🔥</div>
            </div>
          </div>

          {/* AI Chat Button */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-dark mb-1">Mindfulnest AI</h3>
                <p className="text-text-light text-sm">Chat with your personal wellness assistant</p>
              </div>
              <button 
                onClick={handleChatClick}
                className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
                  isPremium 
                    ? 'bg-mint-green text-white hover:scale-105' 
                    : 'bg-gray-200 text-gray-500'
                }`}
                disabled={!isPremium}
              >
                {isPremium ? 'Chat' : '🔒 Pro'}
              </button>
            </div>
          </div>

          {/* Productivity Insight */}
          <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">Daily Insight</h3>
                <p className="text-text-light text-sm leading-relaxed">{dailyTip}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link to="/focus">
              <div className="dopamind-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-mint-green to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl text-white">🎯</span>
                </div>
                <h3 className="text-center font-semibold text-text-dark">Focus</h3>
                <p className="text-center text-xs text-text-light mt-1">Start a session</p>
              </div>
            </Link>

            <Link to="/mood">
              <div className="dopamind-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-warm-orange to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl text-white">😊</span>
                </div>
                <h3 className="text-center font-semibold text-text-dark">Mood</h3>
                <p className="text-center text-xs text-text-light mt-1">Track feelings</p>
              </div>
            </Link>
          </div>

          {/* Premium Features / Upgrade Prompt */}
          {!isPremium ? (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <PremiumUpgradePrompt 
                feature="Unlock Advanced Analytics"
                description="Get detailed insights into your focus patterns and mood trends with AI-powered recommendations."
                tier="pro"
              />
            </div>
          ) : (
            <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Premium Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-light-gray rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-mint-green to-mint-green rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Advanced Analytics</p>
                    <p className="text-xs text-text-light">View detailed focus and mood patterns</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-light-gray rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">🎵</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Premium Soundscapes</p>
                    <p className="text-xs text-text-light">50+ ambient tracks for deep focus</p>
                  </div>
                </div>

                {subscription.isElite && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-warm-orange/10 to-mint-green/10 rounded-2xl border border-warm-orange/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-warm-orange to-mint-green rounded-full flex items-center justify-center">
                      <span className="text-sm text-white">👑</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-dark">Elite Coaching</p>
                      <p className="text-xs text-text-light">1-on-1 virtual wellness sessions</p>
                    </div>
                  </div>
                )}
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default Home;
