
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserSettings {
  dailyFocusGoal: number;
  reminderTime: string;
  theme: 'light' | 'dark';
  customAffirmation: string;
}

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
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [showPricing, setShowPricing] = useState(false);

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

  const handleUpgrade = (tier: 'pro' | 'elite') => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    setSubscription({
      isPro: tier === 'pro' || tier === 'elite',
      isElite: tier === 'elite',
      subscriptionEnd: endDate.toISOString(),
      tier: tier
    });
    setShowPricing(false);
  };

  const totalHours = Math.floor(stats.totalFocusMinutes / 60);
  const totalMinutes = stats.totalFocusMinutes % 60;
  const averageSessionLength = sessions.length > 0 
    ? Math.round(sessions.reduce((sum: number, session: any) => sum + session.duration, 0) / sessions.length)
    : 0;

  const getTierColor = () => {
    switch (subscription.tier) {
      case 'pro': return 'from-serenity-blue to-mindful-mint';
      case 'elite': return 'from-lavender-haze to-mindful-mint';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierLabel = () => {
    switch (subscription.tier) {
      case 'pro': return 'Dopamind Pro';
      case 'elite': return 'Dopamind Elite';
      default: return 'Free';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-gray-50 to-blue-50 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-midnight-slate mb-6 text-center">Profile</h1>

          {/* User Info */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-full flex items-center justify-center mx-auto mb-3 neuro-shadow">
                <span className="text-2xl text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-midnight-slate">{user?.name}</h2>
              <p className="text-slate-600">{user?.email}</p>
              
              {/* Subscription Badge */}
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getTierColor()} mt-3`}>
                {subscription.tier !== 'free' && <span className="mr-1">👑</span>}
                {getTierLabel()}
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Subscription</h3>
            
            {subscription.tier === 'free' ? (
              <div className="text-center">
                <p className="text-slate-600 mb-4">Unlock premium features to enhance your wellness journey</p>
                <Dialog open={showPricing} onOpenChange={setShowPricing}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-serenity-blue to-mindful-mint text-midnight-slate font-semibold rounded-2xl neuro-shadow hover:scale-[1.02] transition-transform">
                      Upgrade to Pro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0 rounded-3xl max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center text-midnight-slate text-xl font-bold">Choose Your Plan</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-6">
                      {/* Pro Plan */}
                      <div className="border-2 border-serenity-blue rounded-2xl p-6 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-serenity-blue text-midnight-slate px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                        </div>
                        <h4 className="text-lg font-bold text-midnight-slate mb-2">Dopamind Pro</h4>
                        <div className="flex items-baseline mb-4">
                          <span className="text-3xl font-bold text-midnight-slate">$4.99</span>
                          <span className="text-slate-600 ml-1">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 mb-6">
                          <li>✓ Unlimited focus sessions</li>
                          <li>✓ Advanced mood analytics</li>
                          <li>✓ Premium soundscapes (50+ tracks)</li>
                          <li>✓ Custom session durations</li>
                          <li>✓ 365-day streak tracking</li>
                          <li>✓ Dark mode themes</li>
                          <li>✓ Offline mode</li>
                        </ul>
                        <Button 
                          onClick={() => handleUpgrade('pro')}
                          className="w-full bg-serenity-blue text-midnight-slate font-semibold rounded-xl"
                        >
                          Start Free Trial
                        </Button>
                      </div>

                      {/* Elite Plan */}
                      <div className="border border-lavender-haze rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-midnight-slate mb-2">Dopamind Elite</h4>
                        <div className="flex items-baseline mb-4">
                          <span className="text-3xl font-bold text-midnight-slate">$9.99</span>
                          <span className="text-slate-600 ml-1">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 mb-6">
                          <li>✓ Everything in Pro</li>
                          <li>✓ 1-on-1 Virtual Coaching</li>
                          <li>✓ Custom Program Creation</li>
                          <li>✓ Family Sharing (6 accounts)</li>
                          <li>✓ Priority Feature Requests</li>
                          <li>✓ Integration Hub</li>
                        </ul>
                        <Button 
                          onClick={() => handleUpgrade('elite')}
                          className="w-full bg-lavender-haze text-midnight-slate font-semibold rounded-xl"
                        >
                          Start Free Trial
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Plan</span>
                  <span className="font-semibold text-midnight-slate">{getTierLabel()}</span>
                </div>
                {subscription.subscriptionEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Renewal Date</span>
                    <span className="text-slate-600">{new Date(subscription.subscriptionEnd).toLocaleDateString()}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl"
                  onClick={() => setShowPricing(true)}
                >
                  {subscription.tier === 'pro' ? 'Upgrade to Elite' : 'Manage Subscription'}
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-midnight-slate mb-4">Your Journey</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-serenity-blue to-mindful-mint bg-clip-text text-transparent">
                  {totalHours}h {totalMinutes}m
                </div>
                <div className="text-sm text-slate-600">Total Focus Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-lavender-haze to-tranquil-green bg-clip-text text-transparent">{stats.currentStreak}</div>
                <div className="text-sm text-slate-600">Current Streak</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-mindful-mint to-tranquil-green bg-clip-text text-transparent">{sessions.length}</div>
                <div className="text-sm text-slate-600">Sessions Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-lavender-haze to-serenity-blue bg-clip-text text-transparent">{averageSessionLength}m</div>
                <div className="text-sm text-slate-600">Avg Session</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-sm text-slate-600 mb-2">
                Daily Goal Progress: {Math.min(100, Math.round((stats.totalFocusMinutes / settings.dailyFocusGoal) * 100))}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-serenity-blue to-mindful-mint h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (stats.totalFocusMinutes / settings.dailyFocusGoal) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-midnight-slate">Settings</h3>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button 
                    onClick={handleSaveSettings}
                    size="sm"
                    className="bg-tranquil-green hover:bg-green-500 rounded-xl"
                  >
                    Save
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dailyGoal" className="text-slate-700 font-semibold">Daily Focus Goal (minutes)</Label>
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
                    className="mt-1 rounded-xl border-zen-ash focus:border-lavender-haze"
                  />
                ) : (
                  <div className="mt-1 text-slate-700 bg-slate-50 rounded-xl p-3">{settings.dailyFocusGoal} minutes</div>
                )}
              </div>

              <div>
                <Label htmlFor="reminderTime" className="text-slate-700 font-semibold">Daily Reminder Time</Label>
                {isEditing ? (
                  <Input
                    id="reminderTime"
                    type="time"
                    value={tempSettings.reminderTime}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      reminderTime: e.target.value
                    }))}
                    className="mt-1 rounded-xl border-zen-ash focus:border-lavender-haze"
                  />
                ) : (
                  <div className="mt-1 text-slate-700 bg-slate-50 rounded-xl p-3">{settings.reminderTime}</div>
                )}
              </div>

              <div>
                <Label htmlFor="affirmation" className="text-slate-700 font-semibold">Personal Affirmation</Label>
                {isEditing ? (
                  <Input
                    id="affirmation"
                    value={tempSettings.customAffirmation}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      customAffirmation: e.target.value
                    }))}
                    placeholder="Enter your personal affirmation"
                    className="mt-1 rounded-xl border-zen-ash focus:border-lavender-haze"
                  />
                ) : (
                  <div className="mt-1 text-slate-700 bg-slate-50 rounded-xl p-3 italic">"{settings.customAffirmation}"</div>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="glass-card rounded-3xl p-6 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50 rounded-xl"
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
