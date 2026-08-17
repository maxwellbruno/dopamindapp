import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface WaterEntry {
  id: string;
  date: string;
  amount_ml: number;
  note: string | null;
}

const quickAmounts = [250, 500, 750];
const DAILY_GOAL_ML = 2000;

interface Props {
  entries: WaterEntry[];
  onLog: (amountMl: number) => void;
  submitting: boolean;
}

const WaterTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [custom, setCustom] = useState('');

  const today = new Date().toDateString();
  const todayTotal = entries
    .filter((e) => new Date(e.date).toDateString() === today)
    .reduce((sum, e) => sum + e.amount_ml, 0);
  const pct = Math.min(100, Math.round((todayTotal / DAILY_GOAL_ML) * 100));

  return (
    <>
      <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-deep-blue mb-1 text-center">Hydration Today</h2>
        <p className="text-center text-sm text-deep-blue/70 mb-4">
          {todayTotal} ml of {DAILY_GOAL_ML} ml
        </p>

        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden mb-6">
          <div
            className="h-full bg-mint-green transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={submitting}
              onClick={() => onLog(amount)}
              className="flex flex-col items-center py-3 rounded-xl bg-mint-green/10 hover:bg-mint-green/20 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">💧</span>
              <span className="text-xs font-semibold text-deep-blue mt-1">{amount} ml</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Custom amount (ml)"
          />
          <Button
            onClick={() => {
              onLog(Number(custom));
              setCustom('');
            }}
            disabled={submitting || !custom || Number(custom) <= 0}
            className="bg-mint-green hover:bg-mint-green/90 text-white rounded-xl font-semibold"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-semibold text-deep-blue mb-3">Recent Hydration</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💧</span>
                <span className="font-medium text-deep-blue">{entry.amount_ml} ml</span>
              </div>
              <span className="text-xs text-deep-blue">
                {new Date(entry.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center text-deep-blue py-4">No water logged yet. Stay hydrated!</div>
          )}
        </div>
      </div>
    </>
  );
};

export default WaterTracker;
