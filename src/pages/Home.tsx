
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalFocusMinutes: number;
  currentStreak: number;
  moodEntries: number;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [stats] = useLocalStorage<Stats>('dopamind_stats', {
    totalFocusMinutes: 0,
    currentStreak: 0,
    moodEntries: 0
  });

  const quotes = [
    "Your mind is a garden. Your thoughts are the seeds you plant.",
    "Focus is not about perfection, it's about intention.",
    "Small mindful moments create lasting change.",
    "Every breath is a chance to reset and refocus.",
    "Progress, not perfection, leads to transformation."
  ];

  const todayQuote = quotes[new Date().getDate() % quotes.length];
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  const wellnessScore = Math.min(100, Math.round((stats.totalFocusMinutes / 10) + (stats.currentStreak * 5) + (stats.moodEntries * 2)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-serenity-blue/5 to-lavender-haze/10 pb-20">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-mindful-mint/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-lavender-haze/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Good {timeOfDay}, {user?.name}! 🌅
                </h1>
                <p className="text-gray-600">How are you feeling today?</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-2xl flex items-center justify-center shadow-lg animate-gentle-pulse">
                <span className="text-xl">🧠</span>
              </div>
            </div>
          </div>

          {/* Daily Inspiration Card */}
          <div className="glass-card rounded-3xl p-6 mb-6 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-lavender-haze to-serenity-blue rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Today's Mindful Moment</h2>
                <p className="text-gray-600 italic leading-relaxed">"{todayQuote}"</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-5 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">🎯</div>
                <div className="w-8 h-1 bg-gradient-to-r from-serenity-blue to-mindful-mint rounded-full"></div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent">
                {Math.floor(stats.totalFocusMinutes / 60)}h {stats.totalFocusMinutes % 60}m
              </div>
              <div className="text-sm text-gray-600 font-medium">Focus Time</div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">🔥</div>
                <div className="w-8 h-1 bg-gradient-to-r from-gentle-amber to-tranquil-green rounded-full"></div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-gentle-amber to-tranquil-green bg-clip-text text-transparent">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 font-medium">Day Streak</div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">😊</div>
                <div className="w-8 h-1 bg-gradient-to-r from-lavender-haze to-serenity-blue rounded-full"></div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-lavender-haze to-serenity-blue bg-clip-text text-transparent">
                {stats.moodEntries}
              </div>
              <div className="text-sm text-gray-600 font-medium">Mood Entries</div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">⭐</div>
                <div className="w-8 h-1 bg-gradient-to-r from-tranquil-green to-mindful-mint rounded-full"></div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-tranquil-green to-mindful-mint bg-clip-text text-transparent">
                {wellnessScore}%
              </div>
              <div className="text-sm text-gray-600 font-medium">Wellness Score</div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-4">
            <Link 
              to="/focus" 
              className="block group animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="glass-card rounded-3xl p-6 neuro-shadow transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-2xl flex items-center justify-center shadow-lg group-hover:animate-gentle-pulse">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800 mb-1">Start Focus Session</div>
                      <div className="text-gray-600 text-sm">Begin a mindful work session</div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/mood" 
              className="block group animate-fade-in-up"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="glass-card rounded-3xl p-6 neuro-shadow transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-lavender-haze to-tranquil-green rounded-2xl flex items-center justify-center shadow-lg group-hover:animate-gentle-pulse">
                      <span className="text-2xl">😊</span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800 mb-1">Track Your Mood</div>
                      <div className="text-gray-600 text-sm">Log how you're feeling</div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
