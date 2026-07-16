import React from 'react';
import { qualityOptions } from './SleepForm';

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: number;
  note: string | null;
}

interface Props {
  sleepEntries: SleepEntry[];
}

const RecentSleepList: React.FC<Props> = ({ sleepEntries }) => {
  return (
    <div className="dopamind-card p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-semibold text-deep-blue mb-3">Recent Sleep</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {sleepEntries.slice(0, 10).map((entry) => {
          const q = qualityOptions.find((o) => o.value === entry.quality);
          return (
            <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{q?.emoji ?? '😴'}</span>
                  <span className="font-medium text-deep-blue">
                    {Number(entry.hours)}h · {q?.label ?? 'Okay'}
                  </span>
                </div>
                <span className="text-xs text-deep-blue">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-deep-blue truncate">{entry.note}</p>
              )}
            </div>
          );
        })}
        {sleepEntries.length === 0 && (
          <div className="text-center text-deep-blue py-4">
            No sleep entries yet. Log your first night!
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSleepList;
