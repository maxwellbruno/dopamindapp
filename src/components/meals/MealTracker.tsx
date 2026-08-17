import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface MealEntry {
  id: string;
  date: string;
  meal_type: string;
  description: string;
  brain_food_rating: number;
  note: string | null;
}

export const mealTypes = [
  { value: 'breakfast', emoji: '🍳', label: 'Breakfast' },
  { value: 'lunch', emoji: '🥗', label: 'Lunch' },
  { value: 'dinner', emoji: '🍲', label: 'Dinner' },
  { value: 'snack', emoji: '🍎', label: 'Snack' },
];

const brainRatings = [
  { value: 1, emoji: '🍟', label: 'Junk' },
  { value: 2, emoji: '🍕', label: 'Heavy' },
  { value: 3, emoji: '🥪', label: 'Balanced' },
  { value: 4, emoji: '🥑', label: 'Nourishing' },
  { value: 5, emoji: '🧠', label: 'Brain food' },
];

interface Props {
  entries: MealEntry[];
  onLog: (entry: { meal_type: string; description: string; brain_food_rating: number; note: string | null }) => void;
  submitting: boolean;
}

const MealTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState('');

  const submit = () => {
    onLog({ meal_type: mealType, description: description.trim(), brain_food_rating: rating, note: note || null });
    setDescription('');
    setNote('');
    setRating(3);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-deep-blue">Log Meal</h2>
          <button onClick={() => setShowForm(false)} className="text-sm text-deep-blue/70">Cancel</button>
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">Meal type</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {mealTypes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMealType(m.value)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                mealType === m.value ? 'bg-mint-green/20 scale-105' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-medium text-deep-blue mt-1">{m.label}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">What did you eat?</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Salmon, spinach and brown rice"
          className="mb-4"
        />

        <label className="block text-sm font-semibold text-deep-blue mb-2">Brain nutrition</label>
        <div className="flex justify-between mb-4">
          {brainRatings.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRating(r.value)}
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                rating === r.value ? 'bg-mint-green/20 scale-110' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-[10px] font-medium text-deep-blue mt-1">{r.label}</span>
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-deep-blue mb-2">Note (optional)</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did it make you feel?"
          className="mb-4"
          rows={3}
        />

        <Button
          onClick={submit}
          disabled={submitting || !description.trim()}
          className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
        >
          {submitting ? 'Saving…' : 'Save Meal'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-deep-blue mb-4 text-center">What did you eat today?</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
        >
          Log a Meal
        </Button>
      </div>

      <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="font-semibold text-deep-blue mb-3">Recent Meals</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {entries.slice(0, 10).map((entry) => {
            const m = mealTypes.find((t) => t.value === entry.meal_type);
            const r = brainRatings.find((b) => b.value === entry.brain_food_rating);
            return (
              <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{m?.emoji ?? '🍽️'}</span>
                    <span className="font-medium text-deep-blue">
                      {m?.label ?? 'Meal'} · {r?.emoji} {r?.label}
                    </span>
                  </div>
                  <span className="text-xs text-deep-blue">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-deep-blue truncate">{entry.description}</p>
              </div>
            );
          })}
          {entries.length === 0 && (
            <div className="text-center text-deep-blue py-4">No meals logged yet. Feed your brain!</div>
          )}
        </div>
      </div>
    </>
  );
};

export default MealTracker;
