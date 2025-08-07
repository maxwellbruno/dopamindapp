import { supabase } from '@/integrations/supabase/client';

export const trackTaskCompletion = async (taskType: string) => {
  try {
    const { error } = await supabase.rpc('update_task_streak', {
      task_type_param: taskType
    });

    if (error) {
      console.error('Error tracking task completion:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking task completion:', error);
    return false;
  }
};

// Helper functions for specific tasks
export const trackAIChatSession = (durationMinutes: number) => {
  if (durationMinutes >= 5) {
    return trackTaskCompletion('ai_chat');
  }
  return false;
};

export const trackFocusSession = (durationMinutes: number) => {
  if (durationMinutes >= 10) {
    return trackTaskCompletion('focus_session');
  }
  return false;
};

export const trackBreathingExercise = (cycles: number) => {
  if (cycles >= 10) {
    return trackTaskCompletion('breathing_exercise');
  }
  return false;
};

export const trackMoodEntry = () => {
  return trackTaskCompletion('mood_entry');
};