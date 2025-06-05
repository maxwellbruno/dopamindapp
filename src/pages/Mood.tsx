
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
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('dopamind_moods', []);
  const [showForm, setShowForm] = useState(false);

  const moods = [
    { emoji: '😫', label: 'Stressed', color: 'bg-red-100' },
    { emoji: '😐', label: 'Meh', color: 'bg-gray-100' },
    { emoji: '🙂', label: 'Okay', color: 'bg-blue-100' },
    { emoji: '😊', label: 'Good', color: 'bg-green-100' },
    { emoji: '😁', label: 'Great', color: 'bg-yellow-100' },
  ];

  const activities = [
    'Worked out', 'Had coffee', 'Meditated', 'Slept well', 
    'Read a book', 'Socialized', 'Ate well', 'Screen time'
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
    setIntensity(3);
    setNote('');
    setSelectedActivities([]);
    setShowForm(false);
  };

  const getMoodSuggestion = () => {
    const recentEntries = moodEntries.slice(0, 3);
    const negativeMoods = recentEntries.filter(entry => ['Stressed', 'Meh'].includes(entry.mood));
    
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
    <div className="min-h-screen bg-light-mint pb-20">
      {/* Header */}
      <div className="bg-deep-blue px-4 py-6 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-white text-center">Mood Tracker</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          {!showForm ? (
            <>
              <div className="dopamind-card p-6 mb-6">
                <h2 className="text-lg font-semibold text-deep-blue mb-4 text-center">Track Your Mood</h2>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-mint-green hover:bg-emerald-600 text-white w-full h-12 rounded-xl font-semibold"
                >
                  How are you feeling?
                </Button>
              </div>

              <div className="dopamind-card p-6 mb-6">
                <h3 className="font-semibold text-deep-blue mb-4">This Month</h3>
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
                        hasEntry ? 'bg-mint-green/20' : 'bg-gray-50'
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
                <h3 className="font-semibold text-deep-blue mb-4">Wellness Suggestion</h3>
                <p className="text-gray-600">{getMoodSuggestion()}</p>
              </div>

              <div className="dopamind-card p-4">
                <h3 className="font-semibold text-deep-blue mb-3">Recent Entries</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {moodEntries.slice(0, 10).map((entry) => {
                    const moodData = moods.find(m => m.label === entry.mood);
                    return (
                      <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodData?.emoji}</span>
                            <span className="font-medium text-deep-blue">{entry.mood}</span>
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
                <h2 className="text-lg font-semibold text-deep-blue">How are you feeling?</h2>
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
                  <div className="grid grid-cols-5 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedMood === mood.label 
                            ? 'bg-mint-green ring-2 ring-deep-blue' 
                            : 'bg-light-mint hover:bg-mint-green/20'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium text-deep-blue">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block text-deep-blue">
                    Intensity (1-5): {intensity}
                  </Label>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setIntensity(val)}
                        className={`w-6 h-6 rounded-full border-2 border-mint-green transition-colors ${
                          intensity === val ? 'bg-mint-green' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="note" className="text-base font-medium mb-3 block text-deep-blue">
                    What's on your mind? (optional)
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe your feelings or what influenced your mood"
                    rows={3}
                    className="border-mint-green focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block text-deep-blue">
                    Activities today (select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {activities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`p-3 text-sm rounded-xl text-center transition-colors ${
                          selectedActivities.includes(activity)
                            ? 'bg-mint-green text-white'
                            : 'bg-light-mint hover:bg-mint-green/20 text-deep-blue'
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
                  className="w-full bg-mint-green hover:bg-emerald-600 text-white h-12 rounded-xl font-semibold"
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

