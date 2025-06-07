
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  note: string;
  activities: string[];
  date: string;
}

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const Mood: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('dopamind_moods', []);
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });
  const [showForm, setShowForm] = useState(false);

  const isPremium = subscription.isPro || subscription.isElite;

  const basicMoods = [
    { emoji: '😡', label: 'Angry', color: 'bg-red-100' },
    { emoji: '😞', label: 'Sad', color: 'bg-blue-100' },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-100' },
    { emoji: '😊', label: 'Happy', color: 'bg-mint-green/20' },
    { emoji: '😄', label: 'Great', color: 'bg-green-100' },
  ];

  const premiumMoods = [
    { emoji: '😰', label: 'Anxious', color: 'bg-yellow-100' },
    { emoji: '😌', label: 'Calm', color: 'bg-blue-100' },
    { emoji: '🤩', label: 'Excited', color: 'bg-purple-100' },
    { emoji: '😴', label: 'Tired', color: 'bg-gray-100' },
    { emoji: '🥰', label: 'Loved', color: 'bg-pink-100' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-orange-100' },
    { emoji: '🤔', label: 'Thoughtful', color: 'bg-indigo-100' },
    { emoji: '😇', label: 'Peaceful', color: 'bg-green-100' },
    { emoji: '😵‍💫', label: 'Confused', color: 'bg-purple-100' },
    { emoji: '🤗', label: 'Grateful', color: 'bg-yellow-100' },
    { emoji: '😎', label: 'Confident', color: 'bg-blue-100' },
    { emoji: '🙃', label: 'Silly', color: 'bg-green-100' },
    { emoji: '😖', label: 'Stressed', color: 'bg-red-100' },
    { emoji: '🥺', label: 'Vulnerable', color: 'bg-pink-100' },
    { emoji: '😤', label: 'Determined', color: 'bg-orange-100' },
    { emoji: '🤯', label: 'Overwhelmed', color: 'bg-purple-100' },
  ];

  const allMoods = isPremium ? [...basicMoods, ...premiumMoods] : basicMoods;

  const basicActivities = [
    'Exercise', 'Work', 'Reading'
  ];

  const premiumActivities = [
    'Social', 'Sleep', 'Meditation', 'Hobbies', 'Travel', 'Cooking', 'Music', 'Gaming', 'Art', 'Nature', 'Study', 'Family Time', 'Self-Care', 'Outdoor Activities', 'Shopping'
  ];

  const allActivities = isPremium ? [...basicActivities, ...premiumActivities] : basicActivities;

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleCustomActivityAdd = () => {
    if (customActivity.trim() && !selectedActivities.includes(customActivity.trim())) {
      setSelectedActivities(prev => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      intensity,
      note,
      activities: selectedActivities,
      date: new Date().toISOString()
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    
    // Update stats
    const stats = JSON.parse(localStorage.getItem('dopamind_stats') || '{"totalFocusMinutes": 0, "currentStreak": 0, "moodEntries": 0}');
    stats.moodEntries += 1;
    localStorage.setItem('dopamind_stats', JSON.stringify(stats));

    // Reset form
    setSelectedMood('');
    setIntensity(3);
    setNote('');
    setSelectedActivities([]);
    setCustomActivity('');
    setShowForm(false);
  };

  const getMoodSuggestion = () => {
    const recentEntries = moodEntries.slice(0, 3);
    const negativeMoods = recentEntries.filter(entry => ['Sad', 'Neutral', 'Angry'].includes(entry.mood));
    
    if (negativeMoods.length >= 2) {
      return "Consider taking a short walk or doing a breathing exercise. Small actions can make a big difference! 🌱";
    }
    return "You're doing great! Keep up with your positive habits. 🌟";
  };

  const getMoodCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toDateString();
      const dayEntries = moodEntries.filter(entry => 
        new Date(entry.date).toDateString() === dateStr
      );
      
      let dayMood = '';
      if (dayEntries.length > 0) {
        dayMood = allMoods.find(m => m.label === dayEntries[0].mood)?.emoji || '';
      }

      calendar.push({
        day,
        mood: dayMood,
        hasEntry: dayEntries.length > 0
      });
    }

    return calendar;
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-deep-blue text-center mb-6 animate-fade-in-up">Mood Tracker</h1>
          
          {showForm ? (
            <div className="dopamind-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-deep-blue">How are you feeling?</h2>
                <Button 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  size="sm"
                  className="text-mint-green border-mint-green hover:bg-mint-green hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {allMoods.slice(0, 10).map((mood, index) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                          selectedMood === mood.label || (selectedMood === '' && mood.label === 'Happy')
                            ? 'bg-mint-green border-mint-green shadow-lg transform scale-110' 
                            : 'bg-white border-gray-200 hover:border-mint-green'
                        }`}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                  
                  {isPremium && allMoods.length > 10 && (
                    <div className="grid grid-cols-5 gap-3">
                      {allMoods.slice(10).map((mood) => (
                        <button
                          key={mood.label}
                          onClick={() => setSelectedMood(mood.label)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                            selectedMood === mood.label
                              ? 'bg-mint-green border-mint-green shadow-lg transform scale-110' 
                              : 'bg-white border-gray-200 hover:border-mint-green'
                          }`}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!isPremium && (
                    <div className="text-center mt-3">
                      <p className="text-xs text-text-light">🔒 More emotions available with Pro</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block text-deep-blue">
                    Intensity
                  </Label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10B981 0%, #10B981 ${(intensity - 1) * 25}%, #e5e7eb ${(intensity - 1) * 25}%, #e5e7eb 100%)`
                      }}
                    />
                    <div 
                      className="absolute top-1/2 w-6 h-6 bg-mint-green rounded-full transform -translate-y-1/2 -translate-x-3 pointer-events-none border-2 border-white shadow-lg"
                      style={{ left: `${(intensity - 1) * 25}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note" className="text-base font-semibold mb-3 block text-deep-blue">
                    Notes
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe your feelings or what influenced your mood"
                    rows={3}
                    className="border-gray-300 focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-white text-deep-blue placeholder-cool-gray"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-deep-blue">
                    Activity
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allActivities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`px-3 py-2 text-sm rounded-full transition-colors ${
                          selectedActivities.includes(activity)
                            ? 'bg-mint-green text-white'
                            : activity === 'Exercise' 
                              ? 'bg-mint-green text-white'
                              : 'bg-light-gray text-deep-blue hover:bg-gray-300 border border-gray-200'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>

                  {isPremium && (
                    <div className="flex gap-2">
                      <Input
                        value={customActivity}
                        onChange={(e) => setCustomActivity(e.target.value)}
                        placeholder="Add custom activity"
                        className="flex-1 bg-white border-gray-300 text-deep-blue placeholder-cool-gray rounded-xl"
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomActivityAdd()}
                      />
                      <Button
                        onClick={handleCustomActivityAdd}
                        size="sm"
                        className="bg-mint-green text-white rounded-xl hover:bg-mint-green/90"
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  {!isPremium && (
                    <p className="text-xs text-text-light mt-2">🔒 More activities and custom activities with Pro</p>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedMood}
                  className="w-full bg-mint-green hover:bg-mint-green/90 text-white h-12 rounded-xl font-semibold"
                >
                  Submit
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="dopamind-card p-6 mb-6 animate-slide-up">
                <h2 className="text-lg font-semibold text-deep-blue mb-4 text-center">How are you feeling today?</h2>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
                >
                  Track Your Mood
                </Button>
              </div>

              <div className="dopamind-card p-6 mb-6 animate-slide-up">
                <h3 className="font-semibold text-deep-blue mb-4">This Month</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs text-deep-blue font-medium p-2">
                      {day}
                    </div>
                  ))}
                  {getMoodCalendar().map(({ day, mood, hasEntry }) => (
                    <div 
                      key={day} 
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                        hasEntry ? 'bg-mint-green/20' : 'bg-light-gray'
                      }`}
                    >
                      {mood ? (
                        <span className="text-lg">{mood}</span>
                      ) : (
                        <span className="text-deep-blue">{day}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dopamind-card p-6 mb-6 animate-slide-up">
                <h3 className="font-semibold text-deep-blue mb-4">Wellness Suggestion</h3>
                <p className="text-deep-blue">{getMoodSuggestion()}</p>
              </div>

              <div className="dopamind-card p-4 animate-slide-up">
                <h3 className="font-semibold text-deep-blue mb-3">Recent Entries</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {moodEntries.slice(0, 10).map((entry) => {
                    const moodData = allMoods.find(m => m.label === entry.mood);
                    return (
                      <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodData?.emoji}</span>
                            <span className="font-medium text-deep-blue">{entry.mood}</span>
                          </div>
                          <span className="text-xs text-deep-blue">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-deep-blue mb-1">{entry.note}</p>
                        )}
                        {entry.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.activities.map((activity, idx) => (
                              <span key={idx} className="text-xs bg-light-gray text-deep-blue px-2 py-1 rounded border">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {moodEntries.length === 0 && (
                    <div className="text-center text-deep-blue py-4">
                      No mood entries yet. Start tracking your mood!
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mood;
