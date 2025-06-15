
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useFocusTimer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDuration, setSessionDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);

  const saveSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
        if (!user) throw new Error("User not authenticated");
        
        const { error: sessionError } = await supabase.from('focus_sessions').insert({
            user_id: user.id,
            name: sessionName || 'Focus Session',
            duration: duration,
        });
        if (sessionError) throw new Error(sessionError.message);

        const { error: statsError } = await supabase.rpc('update_user_stats_on_session_complete', {
            session_duration: duration
        });
        if (statsError) throw new Error(statsError.message);
    },
    onSuccess: () => {
        toast({ title: "Session saved!", description: "Your progress has been updated." });
        queryClient.invalidateQueries({ queryKey: ['focusStats'] });
        queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
        queryClient.invalidateQueries({ queryKey: ['profileStats'] });
    },
    onError: (error: Error) => {
        toast({ title: "Error saving session", description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      saveSessionMutation.mutate(sessionDuration);
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(sessionDuration * 60);
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(sessionDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSessionDurationChange = (value: number) => {
    setSessionDuration(value);
    if (!isRunning) {
      setTimeLeft(value * 60);
    }
  };

  return {
    timeLeft,
    isRunning,
    sessionName,
    setSessionName,
    sessionDuration,
    breakDuration,
    setBreakDuration,
    isBreak,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    handleSessionDurationChange,
  };
};
