
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-gray-50 to-blue-50 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-midnight-slate">
                  {getGreeting()}, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-slate-600">
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
                      ? 'bg-gradient-to-r from-lavender-haze to-mindful-mint' 
                      : 'bg-gradient-to-r from-serenity-blue to-mindful-mint'
                  }`}>
                    {subscription.isElite ? '👑 Elite' : '🧠 Pro'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card rounded-3xl p-4 neuro-shadow animate-fade-in-up">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Daily Focus</h3>
              <div className="text-2xl font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent">
                {totalHours}h {totalMinutes}m
              </div>
              <div className="text-xs text-slate-500 mt-1">{todaySessions} sessions today</div>
            </div>

            <div className="glass-card rounded-3xl p-4 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Mood Summary</h3>
              <div className="text-2xl font-bold bg-gradient-to-r from-lavender-haze to-tranquil-green bg-clip-text text-transparent">
                {getMoodLabel(averageMood)}
              </div>
              <div className="text-xs text-slate-500 mt-1">{moods.length} entries</div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-midnight-slate mb-1">Current Streak</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-gentle-amber to-tranquil-green bg-clip-text text-transparent">
                  {stats.currentStreak} days
                </div>
                <p className="text-sm text-slate-600 mt-1">Keep up the momentum!</p>
              </div>
              <div className="text-4xl animate-gentle-pulse">🔥</div>
            </div>
          </div>

          {/* Productivity Insight */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-mindful-mint to-tranquil-green rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-midnight-slate mb-2">Daily Insight</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{dailyTip}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link to="/focus">
              <div className="glass-card rounded-3xl p-6 neuro-shadow hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl text-white">🎯</span>
                </div>
                <h3 className="text-center font-semibold text-midnight-slate">Focus</h3>
                <p className="text-center text-xs text-slate-600 mt-1">Start a session</p>
              </div>
            </Link>

            <Link to="/mood">
              <div className="glass-card rounded-3xl p-6 neuro-shadow hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-lavender-haze to-tranquil-green rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl text-white">😊</span>
                </div>
                <h3 className="text-center font-semibold text-midnight-slate">Mood</h3>
                <p className="text-center text-xs text-slate-600 mt-1">Track feelings</p>
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
            <div className="glass-card rounded-3xl p-6 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-lg font-semibold text-midnight-slate mb-4">Premium Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-midnight-slate">Advanced Analytics</p>
                    <p className="text-xs text-slate-600">View detailed focus and mood patterns</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-lavender-haze to-tranquil-green rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">🎵</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-midnight-slate">Premium Soundscapes</p>
                    <p className="text-xs text-slate-600">50+ ambient tracks for deep focus</p>
                  </div>
                </div>

                {subscription.isElite && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-lavender-haze/10 to-mindful-mint/10 rounded-2xl border border-lavender-haze/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-lavender-haze to-mindful-mint rounded-full flex items-center justify-center">
                      <span className="text-sm text-white">👑</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-midnight-slate">Elite Coaching</p>
                      <p className="text-xs text-slate-600">1-on-1 virtual wellness sessions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
