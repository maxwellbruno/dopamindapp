import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ShowerEntry {
  id: string;
  date: string;
  shower_type: 'cold' | 'hot';
  duration_minutes: number;
  note: string | null;
}

interface Props {
  entries: ShowerEntry[];
  onLog: (entry: { shower_type: 'cold' | 'hot'; duration_minutes: number; note: string | null }) => void;
  submitting: boolean;
}

const ShowerTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [type, setType] = useState<'cold' | 'hot'>('cold');
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');

  const today = new Date().toDateString();
  const todayCount = entries.filter((e) => new Date(e.date).toDateString() === today).length;
  const coldCount = entries.filter((e) => e.shower_type === 'cold').length;

  const handleSubmit = () => {
    const mins = Number(duration);
    if (!mins || mins <= 0) return;
    onLog({ shower_type: type, duration_minutes: mins, note: note || null });
    setDuration('');
    setNote('');
  };

  return (
    <div className="mt-8">
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-deep-blue mb-1 text-center">Shower Tracker</h2>
        <p className="text-center text-sm text-deep-blue/70 mb-4">
          {todayCount} shower{todayCount === 1 ? '' : 's'} today · {coldCount} cold total
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setType('cold')}
            className={`flex flex-col items-center py-3 rounded-xl transition-all border-2 ${
              type === 'cold'
                ? 'bg-mint-green/20 border-mint-green'
                : 'bg-gray-50 border-transparent hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🧊</span>
            <span className="text-xs font-semibold text-deep-blue mt-1">Cold Shower</span>
          </button>
          <button
            type="button"
            onClick={() => setType('hot')}
            className={`flex flex-col items-center py-3 rounded-xl transition-all border-2 ${
              type === 'hot'
                ? 'bg-mint-green/20 border-mint-green'
                : 'bg-gray-50 border-transparent hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">♨️</span>
            <span className="text-xs font-semibold text-deep-blue mt-1">Hot Shower</span>
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-deep-blue mb-1 block">Duration (minutes)</label>
          <Input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-deep-blue mb-1 block">Note (optional)</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it feel?"
            className="min-h-[60px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !duration || Number(duration) <= 0}
          className="w-full bg-mint-green hover:bg-mint-green/90 text-white rounded-xl font-semibold"
        >
          Log Shower
        </Button>
      </div>

      <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-semibold text-deep-blue mb-3">Recent Showers</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{entry.shower_type === 'cold' ? '🧊' : '♨️'}</span>
                <div>
                  <span className="font-medium text-deep-blue capitalize">
                    {entry.shower_type} · {entry.duration_minutes} min
                  </span>
                  {entry.note && (
                    <p className="text-xs text-deep-blue/70 line-clamp-1">{entry.note}</p>
                  )}
                </div>
              </div>
              <span className="text-xs text-deep-blue">
                {new Date(entry.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center text-deep-blue py-4">No showers logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowerTracker;
