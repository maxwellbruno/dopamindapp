
import React from 'react';

interface SessionSettingsProps {
  sessionDuration: number;
  breakDuration: number;
  canCustomizeDuration: boolean;
  maxFreeSessionDuration: number;
  handleSessionDurationChange: (value: number) => void;
  setBreakDuration: (value: number) => void;
}

const SessionSettings: React.FC<SessionSettingsProps> = ({
  sessionDuration,
  breakDuration,
  canCustomizeDuration,
  maxFreeSessionDuration,
  handleSessionDurationChange,
  setBreakDuration,
}) => (
  <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
    <h3 className="text-lg font-semibold text-text-dark mb-4">Session Settings</h3>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-dark font-medium">Session Duration</span>
          <span className="text-text-light">{sessionDuration} min</span>
          {!canCustomizeDuration && sessionDuration >= maxFreeSessionDuration && (
            <span className="text-xs text-warm-orange bg-warm-orange/10 px-2 py-1 rounded-full">Free Limit</span>
          )}
        </div>
        <input
          type="range"
          min="5"
          max={canCustomizeDuration ? "240" : maxFreeSessionDuration.toString()}
          value={sessionDuration}
          onChange={(e) => handleSessionDurationChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10B981 0%, #10B981 ${((sessionDuration - 5) / (canCustomizeDuration ? 235 : 20)) * 100}%, #e5e7eb ${((sessionDuration - 5) / (canCustomizeDuration ? 235 : 20)) * 100}%, #e5e7eb 100%)`
          }}
        />
        {!canCustomizeDuration && (
          <p className="text-xs text-text-light mt-1">Upgrade to Pro for custom durations up to 4 hours</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-dark font-medium">Break Duration</span>
          <span className="text-text-light">{breakDuration} min</span>
        </div>
        <input
          type="range"
          min="5"
          max="30"
          value={breakDuration}
          onChange={(e) => setBreakDuration(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10B981 0%, #10B981 ${((breakDuration - 5) / 25) * 100}%, #e5e7eb ${((breakDuration - 5) / 25) * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>
    </div>
  </div>
);

export default SessionSettings;
