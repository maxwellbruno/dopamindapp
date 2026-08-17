import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ExerciseEntry {
  id: string;
  date: string;
  activity: string;
  duration_minutes: number;
  intensity: number;
  note: string | null;
}

const activities = [
  { value: 'Walk', emoji: '🚶' },
  { value: 'Run', emoji: '🏃' },
  { value: 'Gym', emoji: '🏋️' },
  { value: 'Yoga', emoji: '🧘' },
  { value: 'Cycling', emoji: '🚴' },
  { value: 'Swim', emoji: '🏊' },
];

const intensities = [
  { value: 1, emoji: '🌱', label: 'Light' },
  { value: 2, emoji: '🙂', label: 'Easy' },
  { value: 3, emoji: '💪', label: 'Moderate' },
  { value: 4, emoji: '🔥', label: 'Hard' },
  { value: 5, emoji: '⚡', label: 'Max' },
];

interface Props {
  entries: ExerciseEntry[];
  onLog: (entry: { activity: string; duration_minutes: number; intensity: number; note: string | null }) => void;
  submitting: boolean;
}

const ExerciseTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [showForm, setShowForm] = useState(false);
  const [activity, setActivity] = useState('Walk');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');

  const weekTotal = entries
    .filter((e) => Date.now() - new Date(e.date).getTime() < 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, e) => sum + e.duration_minutes, 0);

  const submit = () => {
    onLog({ activity, duration_minutes: Number(duration), intensity, note: note || null });
    setDuration('');
    setNote('');
    setIntensity(3);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-deep-blue">Log Exercise</h2>
          <button onClick={() => setShowForm(false)} className="text-sm text-deep-blue/70">Cancel</button>
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">Activity</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {activities.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setActivity(a.value)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                activity === a.value ? 'bg-mint-green/20 scale-105' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-[10px] font-medium text-deep-blue mt-1">{a.value}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">Duration (minutes)</label>
        <Input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 30"
          className="mb-4"
        />

        <label className="block text-sm font-semibold text-deep-blue mb-2">Intensity</label>
        <div className="flex justify-between mb-4">
          {intensities.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setIntensity(i.value)}
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                intensity === i.value ? 'bg-mint-green/20 scale-110' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{i.emoji}</span>
              <span className="text-[10px] font-medium text-deep-blue mt-1">{i.label}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">Note (optional)</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did the session feel?"
          className="mb-4"
          rows={3}
        />

        <Button
          onClick={submit}
          disabled={submitting || !duration || Number(duration) <= 0}
          className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
        >
          {submitting ? 'Saving…' : 'Save Exercise'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-deep-blue mb-1 text-center">Movement this week</h2>
        <p className="text-center text-sm text-deep-blue/70 mb-4">{weekTotal} minutes logged</p>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
        >
          Log Exercise
        </Button>
      </div>

      <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="font-semibold text-deep-blue mb-3">Recent Workouts</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {entries.slice(0, 10).map((entry) => {
            const a = activities.find((x) => x.value === entry.activity);
            const i = intensities.find((x) => x.value === entry.intensity);
            return (
              <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{a?.emoji ?? '🏃'}</span>
                    <span className="font-medium text-deep-blue">
                      {entry.activity} · {entry.duration_minutes} min · {i?.label ?? 'Moderate'}
                    </span>
                  </div>
                  <span className="text-xs text-deep-blue">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                {entry.note && <p className="text-sm text-deep-blue truncate">{entry.note}</p>}
              </div>
            );
          })}
          {entries.length === 0 && (
            <div className="text-center text-deep-blue py-4">No workouts yet. Get moving!</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExerciseTracker;
