import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const qualityOptions = [
  { value: 1, emoji: '😩', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Great' },
];

interface SleepFormProps {
  onClose: () => void;
  hours: string;
  setHours: (h: string) => void;
  quality: number;
  setQuality: (q: number) => void;
  note: string;
  setNote: (n: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const SleepForm: React.FC<SleepFormProps> = ({
  onClose, hours, setHours, quality, setQuality, note, setNote, onSubmit, submitting,
}) => {
  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-deep-blue">Log Sleep</h2>
        <button onClick={onClose} className="text-sm text-deep-blue/70">Cancel</button>
      </div>

      <label className="block text-sm font-semibold text-deep-blue mb-2">Hours slept</label>
      <Input
        type="number"
        min={0}
        max={24}
        step={0.25}
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        placeholder="e.g. 7.5"
        className="mb-4"
      />

      <label className="block text-sm font-semibold text-deep-blue mb-2">Sleep quality</label>
      <div className="flex justify-between mb-4">
        {qualityOptions.map((q) => (
          <button
            key={q.value}
            type="button"
            onClick={() => setQuality(q.value)}
            className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
              quality === q.value
                ? 'bg-mint-green/20 scale-110'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">{q.emoji}</span>
            <span className="text-[10px] font-medium text-deep-blue mt-1">{q.label}</span>
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold text-deep-blue mb-2">Note (optional)</label>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Dreams, disturbances, how you feel now…"
        className="mb-4"
        rows={3}
      />

      <Button
        onClick={onSubmit}
        disabled={submitting || !hours || Number(hours) <= 0}
        className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
      >
        {submitting ? 'Saving…' : 'Save Sleep Entry'}
      </Button>
    </div>
  );
};

export default SleepForm;
export { qualityOptions };
