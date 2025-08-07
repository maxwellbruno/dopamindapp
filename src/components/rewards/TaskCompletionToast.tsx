import React from 'react';
import { toast } from 'sonner';
import { Trophy, Flame } from 'lucide-react';

interface TaskCompletionData {
  taskType: string;
  currentStreak: number;
  rewardEarned?: boolean;
  rewardAmount?: number;
}

export const showTaskCompletionToast = (data: TaskCompletionData) => {
  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case 'ai_chat':
        return 'AI Chat Session';
      case 'focus_session':
        return 'Focus Session';
      case 'breathing_exercise':
        return 'Breathing Exercise';
      case 'mood_entry':
        return 'Mood Entry';
      default:
        return 'Task';
    }
  };

  const message = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="font-medium">{data.currentStreak} day streak!</span>
      </div>
      {data.rewardEarned && data.rewardAmount && (
        <div className="flex items-center gap-1 text-mint-green">
          <Trophy className="h-4 w-4" />
          <span className="font-semibold">+{data.rewardAmount} DOP</span>
        </div>
      )}
    </div>
  );

  if (data.rewardEarned) {
    toast.success(`${getTaskLabel(data.taskType)} completed!`, {
      description: message,
      duration: 5000,
    });
  } else {
    toast.success(`${getTaskLabel(data.taskType)} completed!`, {
      description: `${data.currentStreak} day streak - ${7 - data.currentStreak} more for reward!`,
      duration: 3000,
    });
  }
};