
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
    "Focus is a matter of deciding what things you're not going to do.",
    "The present moment is the only time over which we have dominion.",
    "Your mind is a garden. Your thoughts are the seeds.",
    "Progress, not perfection.",
    "Small steps daily lead to big dreams achieved yearly."
  ];

  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name}!
            </h1>
            <p className="text-gray-600">How are you feeling today?</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Inspiration</h2>
            <p className="text-gray-600 italic text-center">"{todayQuote}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-blue-600">{Math.floor(stats.totalFocusMinutes / 60)}h {stats.totalFocusMinutes % 60}m</div>
              <div className="text-sm text-gray-600">Focus Time</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl mb-2">😊</div>
              <div className="text-2xl font-bold text-green-600">{stats.moodEntries}</div>
              <div className="text-sm text-gray-600">Mood Entries</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-gray-600">Wellness Score</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link 
              to="/focus" 
              className="block bg-blue-500 text-white rounded-xl p-4 shadow-lg hover:bg-blue-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Start Focus Session</div>
                  <div className="text-blue-100 text-sm">Begin a productive work session</div>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
            </Link>
            
            <Link 
              to="/mood" 
              className="block bg-green-500 text-white rounded-xl p-4 shadow-lg hover:bg-green-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Track Your Mood</div>
                  <div className="text-green-100 text-sm">Log how you're feeling</div>
                </div>
                <div className="text-2xl">😊</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
