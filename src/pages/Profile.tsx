
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserSettings {
  dailyFocusGoal: number;
  reminderTime: string;
  theme: 'light' | 'dark';
  customAffirmation: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useLocalStorage<UserSettings>('dopamind_settings', {
    dailyFocusGoal: 120,
    reminderTime: '09:00',
    theme: 'light',
    customAffirmation: 'I am focused and productive'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
  const sessions = JSON.parse(localStorage.getItem('dopamind_sessions') || '[]');

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  const totalHours = Math.floor(stats.totalFocusMinutes / 60);
  const totalMinutes = stats.totalFocusMinutes % 60;
  const averageSessionLength = sessions.length > 0 
    ? Math.round(sessions.reduce((sum: number, session: any) => sum + session.duration, 0) / sessions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Profile</h1>

          {/* User Info */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Journey</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalHours}h {totalMinutes}m
                </div>
                <div className="text-sm text-gray-600">Total Focus Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sessions.length}</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{averageSessionLength}m</div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">
                Daily Goal Progress: {Math.min(100, Math.round((stats.totalFocusMinutes / settings.dailyFocusGoal) * 100))}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (stats.totalFocusMinutes / settings.dailyFocusGoal) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button 
                    onClick={handleSaveSettings}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Save
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dailyGoal">Daily Focus Goal (minutes)</Label>
                {isEditing ? (
                  <Input
                    id="dailyGoal"
                    type="number"
                    value={tempSettings.dailyFocusGoal}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      dailyFocusGoal: Number(e.target.value)
                    }))}
                    min="30"
                    max="480"
                  />
                ) : (
                  <div className="mt-1 text-gray-700">{settings.dailyFocusGoal} minutes</div>
                )}
              </div>

              <div>
                <Label htmlFor="reminderTime">Daily Reminder Time</Label>
                {isEditing ? (
                  <Input
                    id="reminderTime"
                    type="time"
                    value={tempSettings.reminderTime}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      reminderTime: e.target.value
                    }))}
                  />
                ) : (
                  <div className="mt-1 text-gray-700">{settings.reminderTime}</div>
                )}
              </div>

              <div>
                <Label htmlFor="affirmation">Personal Affirmation</Label>
                {isEditing ? (
                  <Input
                    id="affirmation"
                    value={tempSettings.customAffirmation}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      customAffirmation: e.target.value
                    }))}
                    placeholder="Enter your personal affirmation"
                  />
                ) : (
                  <div className="mt-1 text-gray-700 italic">"{settings.customAffirmation}"</div>
                )}
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                {isEditing ? (
                  <select
                    id="theme"
                    value={tempSettings.theme}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      theme: e.target.value as 'light' | 'dark'
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                ) : (
                  <div className="mt-1 text-gray-700 capitalize">{settings.theme}</div>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50"
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
