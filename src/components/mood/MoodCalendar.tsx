
import React from 'react';
import { MoodEntry, Mood } from '@/types/mood';

interface MoodCalendarProps {
  moodEntries: MoodEntry[];
  allMoods: Mood[];
}

const MoodCalendar: React.FC<MoodCalendarProps> = ({ moodEntries, allMoods }) => {
  const today = new Date();
  const monthYearLabel = today.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const getMoodCalendar = () => {
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
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-semibold text-deep-blue mb-1">
        {monthYearLabel}
      </h3>
      <div className="text-sm text-gray-500 mb-3">This Month</div>
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
  );
};

export default MoodCalendar;
