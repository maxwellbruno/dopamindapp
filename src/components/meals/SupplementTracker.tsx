import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SupplementEntry {
  id: string;
  name: string;
  brand: string | null;
  amount: string | null;
  frequency: string;
  taken_at: string;
}

export const frequencies = ['Once', 'Daily', 'Twice daily', 'Weekly', 'As needed'];

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface Props {
  entries: SupplementEntry[];
  onLog: (entry: { name: string; brand: string | null; amount: string | null; frequency: string; taken_at: string }) => void;
  submitting: boolean;
}

const SupplementTracker: React.FC<Props> = ({ entries, onLog, submitting }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState(nowTime());
  const [frequency, setFrequency] = useState('Daily');

  const submit = () => {
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
    onLog({
      name: name.trim(),
      brand: brand.trim() || null,
      amount: amount.trim() || null,
      frequency,
      taken_at: d.toISOString(),
    });
    setName('');
    setBrand('');
    setAmount('');
    setTime(nowTime());
    setFrequency('Daily');
    setShowForm(false);
  };

  return (
    <div className="dopamind-card p-6 mt-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-deep-blue">Brain Supplements</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm font-medium text-mint-green"
        >
          {showForm ? 'Cancel' : '+ Log Supplement'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-deep-blue mb-2">Supplement name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Omega-3" className="mb-4" maxLength={100} />

          <label className="block text-sm font-semibold text-deep-blue mb-2">Brand (optional)</label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Nordic Naturals" className="mb-4" maxLength={100} />

          <label className="block text-sm font-semibold text-deep-blue mb-2">Amount</label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500 mg or 2 capsules" className="mb-4" maxLength={50} />

          <label className="block text-sm font-semibold text-deep-blue mb-2">Time taken</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mb-4" />

          <label className="block text-sm font-semibold text-deep-blue mb-2">Frequency</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {frequencies.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  frequency === f
                    ? 'bg-mint-green/20 border-mint-green text-deep-blue'
                    : 'border-gray-200 text-deep-blue/70 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <Button
            onClick={submit}
            disabled={submitting || !name.trim()}
            className="bg-mint-green hover:bg-mint-green/90 text-white w-full h-12 rounded-xl font-semibold"
          >
            {submitting ? 'Saving…' : 'Save Supplement'}
          </Button>
        </div>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {entries.slice(0, 10).map((entry) => (
          <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-deep-blue">
                💊 {entry.name}
                {entry.brand ? ` · ${entry.brand}` : ''}
              </span>
              <span className="text-xs text-deep-blue">
                {new Date(entry.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-deep-blue/70">
              {[entry.amount, entry.frequency].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center text-deep-blue py-4">No supplements logged yet.</div>
        )}
      </div>
    </div>
  );
};

export default SupplementTracker;
