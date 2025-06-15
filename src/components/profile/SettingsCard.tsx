
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { UserSettings } from '../../types/settings';

interface SettingsCardProps {
  settings: UserSettings;
  setSettings: (value: UserSettings | ((val: UserSettings) => UserSettings)) => void;
  subscriptionTier: 'free' | 'pro' | 'elite';
}

const SettingsCard: React.FC<SettingsCardProps> = ({ settings, setSettings, subscriptionTier }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  // This useEffect handles live preview of theme changes and reverts on cancel.
  useEffect(() => {
    const root = window.document.documentElement;
    const themeToApply = isEditing ? tempSettings.theme : settings.theme;
    const canUseDarkMode = subscriptionTier === 'pro' || subscriptionTier === 'elite';

    if (canUseDarkMode && themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isEditing, tempSettings.theme, settings.theme, subscriptionTier]);


  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Settings</h3>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-mint-green text-white rounded-xl hover:bg-mint-green/90"
            size="sm"
          >
            Edit
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              onClick={handleSaveSettings}
              size="sm"
              className="bg-mint-green hover:bg-mint-green/90 text-white rounded-xl"
            >
              Save
            </Button>
            <Button 
              onClick={handleCancelEdit}
              variant="outline"
              size="sm"
              className="rounded-xl !bg-white !border-deep-blue !text-deep-blue hover:!bg-deep-blue hover:!text-white focus:!bg-deep-blue focus:!text-white active:!bg-deep-blue active:!text-white focus:ring-2 focus:ring-deep-blue"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="dailyGoal" className="text-text-dark font-semibold">Daily Focus Goal (minutes)</Label>
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
              className="mt-1 rounded-xl border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none text-deep-blue bg-white"
            />
          ) : (
            <div className="mt-1 text-deep-blue bg-gray-100 rounded-xl p-3">{settings.dailyFocusGoal} minutes</div>
          )}
        </div>

        <div>
          <Label htmlFor="reminderTime" className="text-text-dark font-semibold">Daily Reminder Time</Label>
          {isEditing ? (
            <Input
              id="reminderTime"
              type="time"
              value={tempSettings.reminderTime}
              onChange={(e) => setTempSettings(prev => ({
                ...prev,
                reminderTime: e.target.value
              }))}
              className="mt-1 rounded-xl border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none text-deep-blue bg-white"
            />
          ) : (
            <div className="mt-1 text-deep-blue bg-gray-100 rounded-xl p-3">{settings.reminderTime}</div>
          )}
        </div>

        <div>
          <Label htmlFor="affirmation" className="text-text-dark font-semibold">Personal Affirmation</Label>
          {isEditing ? (
            <Input
              id="affirmation"
              value={tempSettings.customAffirmation}
              onChange={(e) => setTempSettings(prev => ({
                ...prev,
                customAffirmation: e.target.value
              }))}
              placeholder="Enter your personal affirmation"
              className="mt-1 rounded-xl border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none text-deep-blue bg-white"
            />
          ) : (
            <div className="mt-1 text-deep-blue bg-white rounded-xl p-3 italic border border-gray-200">"{settings.customAffirmation}"</div>
          )}
        </div>

        <div>
          <Label htmlFor="theme" className="text-text-dark font-semibold flex items-center gap-2">
            Dark Mode
            {subscriptionTier === 'free' && isEditing && <Lock className="h-4 w-4 text-gray-400" />}
          </Label>
          {isEditing ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 mt-1">
                  <Switch
                    id="theme"
                    checked={
                      (subscriptionTier === 'free')
                        ? false
                        : tempSettings.theme === 'dark'
                    }
                    disabled={subscriptionTier === 'free'}
                    onCheckedChange={checked => {
                      if (subscriptionTier !== 'free') {
                        setTempSettings(prev => ({
                          ...prev,
                          theme: checked ? 'dark' : 'light'
                        }));
                      }
                    }}
                  />
                  <span className="text-text-light capitalize select-none">
                    {subscriptionTier !== 'free' ? tempSettings.theme : 'Light'}
                  </span>
                </div>
              </TooltipTrigger>
              {subscriptionTier === 'free' && (
                <TooltipContent>
                  <p>Upgrade to Pro to unlock Dark Mode.</p>
                </TooltipContent>
              )}
            </Tooltip>
          ) : (
            <div className="mt-1 text-deep-blue bg-gray-100 rounded-xl p-3 capitalize">{settings.theme}</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SettingsCard;
