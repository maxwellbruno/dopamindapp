
import React, { useState } from 'react';
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
    'Worked out', 'Had coffee', 'Slept well', 'Meditated', 'Spent time outdoors',
    'Socialized', 'Ate healthy', 'Listened to music', 'Read a book', 'Learned something new'
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
        // Get the most recent mood for that day
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mood Tracker</h1>

          {!showForm ? (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">How are you feeling today?</h2>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 w-full"
                >
                  Track Your Mood
                </Button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">This Month</h3>
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
                        hasEntry ? 'bg-blue-100' : 'bg-gray-50'
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

              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Wellness Suggestion</h3>
                <p className="text-gray-600">{getMoodSuggestion()}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Entries</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {moodEntries.slice(0, 10).map((entry) => {
                    const moodData = moods.find(m => m.label === entry.mood);
                    return (
                      <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodData?.emoji}</span>
                            <span className="font-medium">{entry.mood}</span>
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
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Track Your Mood</h2>
                <Button 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">How are you feeling?</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedMood === mood.label 
                            ? `${mood.color} ring-2 ring-blue-500` 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Intensity (1-10): {intensity}
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <Label htmlFor="note" className="text-base font-medium mb-3 block">
                    What's on your mind? (optional)
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe your feelings or what influenced your mood..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Activities today (select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {activities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`p-2 text-sm rounded-lg text-left transition-colors ${
                          selectedActivities.includes(activity)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
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
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Save Mood Entry
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
