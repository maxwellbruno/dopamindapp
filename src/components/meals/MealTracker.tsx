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
  brain_foods?: string[] | null;
  brain_herbs?: string[] | null;
  wellness_teas?: string[] | null;
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

const BRAIN_FOODS = [
  'Fatty fish',
  'Eggs',
  'Avocado',
  'Nuts and seeds',
  'Berries',
  'Leafy greens',
  'Beans/lentils',
  'Whole grains',
];
const OTHER_FOOD = 'Other nutrient-dense foods';

const BRAIN_HERBS = ['Turmeric', 'Ginger', 'Rosemary', 'Basil', 'Cinnamon', 'Peppermint'];
const OTHER_HERB = 'Other herbs';

const WELLNESS_TEAS = ['Chamomile', 'Peppermint', 'Ginger', 'Green tea', 'Rooibos', 'Hibiscus'];
const OTHER_TEA = 'Other herbal teas';

interface ChipGroupProps {
  label: string;
  options: string[];
  otherLabel: string;
  selected: string[];
  setSelected: (v: string[]) => void;
  otherValue: string;
  setOtherValue: (v: string) => void;
  placeholder: string;
}

const ChipGroup: React.FC<ChipGroupProps> = ({
  label,
  options,
  otherLabel,
  selected,
  setSelected,
  otherValue,
  setOtherValue,
  placeholder,
}) => {
  const [showOther, setShowOther] = useState(false);
  const toggle = (opt: string) =>
    setSelected(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-deep-blue mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selected.includes(opt)
                ? 'bg-mint-green/20 border-mint-green text-deep-blue'
                : 'border-gray-200 text-deep-blue/70 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowOther((s) => !s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            showOther || otherValue.trim()
              ? 'bg-mint-green/20 border-mint-green text-deep-blue'
              : 'border-gray-200 text-deep-blue/70 hover:bg-gray-50'
          }`}
        >
          {otherLabel}
        </button>
      </div>
      {(showOther || otherValue.trim()) && (
        <Input
          value={otherValue}
          onChange={(e) => setOtherValue(e.target.value)}
          placeholder={placeholder}
          className="mt-2"
          maxLength={120}
        />
      )}
    </div>
  );
};

interface Props {
  entries: MealEntry[];
  onLog: (entry: {
    meal_type: string;
    description: string;
    brain_food_rating: number;
    note: string | null;
    brain_foods: string[];
    brain_herbs: string[];
    wellness_teas: string[];
  }) => void;
  submitting: boolean;
}

const MealTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState('');

  const [foods, setFoods] = useState<string[]>([]);
  const [otherFood, setOtherFood] = useState('');
  const [herbs, setHerbs] = useState<string[]>([]);
  const [otherHerb, setOtherHerb] = useState('');
  const [teas, setTeas] = useState<string[]>([]);
  const [otherTea, setOtherTea] = useState('');

  const withOther = (list: string[], other: string) =>
    other.trim() ? [...list, other.trim()] : list;

  const submit = () => {
    onLog({
      meal_type: mealType,
      description: description.trim(),
      brain_food_rating: rating,
      note: note || null,
      brain_foods: withOther(foods, otherFood),
      brain_herbs: withOther(herbs, otherHerb),
      wellness_teas: withOther(teas, otherTea),
    });
    setDescription('');
    setNote('');
    setRating(3);
    setFoods([]);
    setOtherFood('');
    setHerbs([]);
    setOtherHerb('');
    setTeas([]);
    setOtherTea('');
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

        <ChipGroup
          label="Brain foods"
          options={BRAIN_FOODS}
          otherLabel={OTHER_FOOD}
          selected={foods}
          setSelected={setFoods}
          otherValue={otherFood}
          setOtherValue={setOtherFood}
          placeholder="Name the nutrient-dense food"
        />

        <ChipGroup
          label="Brain herbs"
          options={BRAIN_HERBS}
          otherLabel={OTHER_HERB}
          selected={herbs}
          setSelected={setHerbs}
          otherValue={otherHerb}
          setOtherValue={setOtherHerb}
          placeholder="Name the herb"
        />

        <ChipGroup
          label="Relaxation & wellness teas"
          options={WELLNESS_TEAS}
          otherLabel={OTHER_TEA}
          selected={teas}
          setSelected={setTeas}
          otherValue={otherTea}
          setOtherValue={setOtherTea}
          placeholder="Name the herbal tea"
        />

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
            const tags = [
              ...(entry.brain_foods ?? []),
              ...(entry.brain_herbs ?? []),
              ...(entry.wellness_teas ?? []),
            ];
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
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-mint-green/15 text-[10px] text-deep-blue">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
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
