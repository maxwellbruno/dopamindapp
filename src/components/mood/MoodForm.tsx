
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mood } from '@/types/mood';

interface MoodFormProps {
  onClose: () => void;
  allMoods: Mood[];
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
  intensity: number;
  setIntensity: (value: number) => void;
  note: string;
  setNote: (note: string) => void;
  allActivities: string[];
  selectedActivities: string[];
  handleActivityToggle: (activity: string) => void;
  isPremium: boolean;
  customActivity: string;
  setCustomActivity: (value: string) => void;
  handleCustomActivityAdd: () => void;
  handleSubmit: () => void;
}

const MoodForm: React.FC<MoodFormProps> = ({
  onClose,
  allMoods,
  selectedMood,
  setSelectedMood,
  intensity,
  setIntensity,
  note,
  setNote,
  allActivities,
  selectedActivities,
  handleActivityToggle,
  isPremium,
  customActivity,
  setCustomActivity,
  handleCustomActivityAdd,
  handleSubmit,
}) => {
  return (
    <div className="dopamind-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-deep-blue">How are you feeling?</h2>
        <Button 
          onClick={onClose}
          variant="outline"
          size="sm"
          className="dopamind-modal-close !bg-deep-blue !text-white !border-deep-blue hover:!bg-deep-blue hover:!text-white focus:!bg-deep-blue focus:!text-white active:!bg-deep-blue active:!text-white rounded-full w-10 h-10 flex items-center justify-center"
          style={{
            backgroundColor: "#1E3A8A",
            color: "#fff",
            borderColor: "#1E3A8A",
          }}
        >
          ✕
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-4">
            {allMoods.slice(0, 10).map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(mood.label)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                  selectedMood === mood.label
                    ? 'bg-mint-green border-mint-green shadow-lg transform scale-110' 
                    : 'bg-white border-gray-200 hover:border-mint-green'
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
          
          {isPremium && allMoods.length > 10 && (
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {allMoods.slice(10).map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                    selectedMood === mood.label
                      ? 'bg-mint-green border-mint-green shadow-lg transform scale-110' 
                      : 'bg-white border-gray-200 hover:border-mint-green'
                  }`}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          )}
          
          {!isPremium && (
            <div className="text-center mt-3">
              <p className="text-xs text-text-light">🔒 More emotions available with Pro</p>
            </div>
          )}
        </div>

        <div>
          <Label className="text-base font-semibold mb-4 block text-deep-blue">
            Intensity
          </Label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${(intensity - 1) * 25}%, #e5e7eb ${(intensity - 1) * 25}%, #e5e7eb 100%)`
              }}
            />
            <div 
              className="absolute top-1/2 w-6 h-6 bg-mint-green rounded-full transform -translate-y-1/2 -translate-x-3 pointer-events-none border-2 border-white shadow-lg"
              style={{ left: `${(intensity - 1) * 25}%` }}
            ></div>
          </div>
        </div>

        <div>
          <Label htmlFor="note" className="text-base font-semibold mb-3 block text-deep-blue">
            Notes
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe your feelings or what influenced your mood"
            rows={3}
            className="border-gray-300 focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-white text-deep-blue"
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block text-deep-blue">
            Activity
          </Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {allActivities.map((activity) => (
              <button
                key={activity}
                onClick={() => handleActivityToggle(activity)}
                className={`px-3 py-2 text-sm rounded-full transition-colors ${
                  selectedActivities.includes(activity)
                    ? 'bg-mint-green text-white'
                    : 'bg-light-gray text-deep-blue hover:bg-gray-300 border border-gray-200'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>

          {isPremium && (
            <div className="flex gap-2">
              <Input
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
                placeholder="Add custom activity"
                className="flex-1 bg-white border-gray-300 text-deep-blue rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomActivityAdd()}
              />
              <Button
                onClick={handleCustomActivityAdd}
                size="sm"
                className="bg-mint-green text-white rounded-xl hover:bg-mint-green/90"
              >
                Add
              </Button>
            </div>
          )}

          {!isPremium && (
            <p className="text-xs text-text-light mt-2">🔒 More activities and custom activities with Pro</p>
          )}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full bg-mint-green hover:bg-mint-green/90 text-white h-12 rounded-xl font-semibold"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default MoodForm;
