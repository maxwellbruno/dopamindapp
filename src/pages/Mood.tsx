import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronLeft } from 'lucide-react';

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  note: string;
  activities: string[];
  date: string;
}

const Mood: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('dopamind_moods', []);
  const [showForm, setShowForm] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-200' },
    { emoji: '😌', label: 'Calm', color: 'bg-blue-200' },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-200' },
    { emoji: '😟', label: 'Anxious', color: 'bg-orange-200' },
    { emoji: '😢', label: 'Sad', color: 'bg-blue-300' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-red-200' },
    { emoji: '😴', label: 'Tired', color: 'bg-purple-200' },
    { emoji: '🤗', label: 'Grateful', color: 'bg-green-200' },
  ];

  const activities = [
    'Exercise', 'Work', 'Reading', 'Meditation', 'Socializing',
    'Gaming', 'Music', 'Sleep', 'Outdoor', 'Learning'
  ];

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
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
    setIntensity(5);
    setNote('');
    setSelectedActivities([]);
    setShowForm(false);
  };

  const getMoodSuggestion = () => {
    const recentEntries = moodEntries.slice(0, 3);
    const negativeMoods = recentEntries.filter(entry => ['Sad', 'Anxious', 'Frustrated'].includes(entry.mood));
    
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
        dayMood = moods.find(m => m.label === dayEntries[0].mood)?.emoji || '';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-800 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <ChevronLeft className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Mood Tracker</h1>
            <div className="w-6 h-6"></div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          {!showForm ? (
            <>
              <div className="dopamind-card p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 text-center">How are you feeling?</h2>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white w-full h-12 rounded-xl font-semibold"
                >
                  Track Your Mood
                </Button>
              </div>

              <div className="dopamind-card p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-4">This Month</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
                      {day}
                    </div>
                  ))}
                  {getMoodCalendar().map(({ day, mood, hasEntry }) => (
                    <div 
                      key={day} 
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                        hasEntry ? 'bg-emerald-100' : 'bg-gray-50'
                      }`}
                    >
                      {mood ? (
                        <span className="text-lg">{mood}</span>
                      ) : (
                        <span className="text-gray-400">{day}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dopamind-card p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-4">Wellness Suggestion</h3>
                <p className="text-gray-600">{getMoodSuggestion()}</p>
              </div>

              <div className="dopamind-card p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Recent Entries</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {moodEntries.slice(0, 10).map((entry) => {
                    const moodData = moods.find(m => m.label === entry.mood);
                    return (
                      <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodData?.emoji}</span>
                            <span className="font-medium text-blue-800">{entry.mood}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600 mb-1">{entry.note}</p>
                        )}
                        {entry.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.activities.map((activity, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {moodEntries.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No mood entries yet. Start tracking your mood!
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="dopamind-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-blue-800">How are you feeling?</h2>
                <Button 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 border-gray-200"
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-4 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedMood === mood.label 
                            ? 'bg-emerald-100 ring-2 ring-emerald-500' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium text-blue-800">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block text-blue-800">
                    Intensity
                  </Label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-emerald"
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-800 text-white px-2 py-1 rounded text-sm">
                      {intensity}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note" className="text-base font-medium mb-3 block text-blue-800">
                    Notes
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={3}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block text-blue-800">
                    Activity
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {activities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`p-2 text-sm rounded-lg text-center transition-colors ${
                          selectedActivities.includes(activity)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-blue-800'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedMood}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl font-semibold"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mood;
