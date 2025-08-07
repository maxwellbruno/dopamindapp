import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TaskStreak {
  taskType: string;
  currentStreak: number;
  totalCompletions: number;
  lastCompletedDate?: string;
}

interface PendingReward {
  id: string;
  rewardType: string;
  amount: number;
  weekStartDate: string;
  weekEndDate: string;
  claimed: boolean;
}

export const useRewards = () => {
  const { user } = useAuth();
  const [taskStreaks, setTaskStreaks] = useState<TaskStreak[]>([]);
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [totalDopamineEarned, setTotalDopamineEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch task streaks
  const fetchTaskStreaks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_task_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching task streaks:', error);
        return;
      }

      const transformedStreaks = (data || []).map(streak => ({
        taskType: streak.task_type,
        currentStreak: streak.current_streak,
        totalCompletions: streak.total_completions,
        lastCompletedDate: streak.last_completed_date
      }));
      setTaskStreaks(transformedStreaks);
    } catch (error) {
      console.error('Error fetching task streaks:', error);
    }
  };

  // Fetch pending rewards
  const fetchPendingRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dopamine_rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('claimed', false);

      if (error) {
        console.error('Error fetching pending rewards:', error);
        return;
      }

      const transformedRewards = (data || []).map(reward => ({
        id: reward.id,
        rewardType: reward.reward_type,
        amount: reward.amount,
        weekStartDate: reward.week_start_date,
        weekEndDate: reward.week_end_date,
        claimed: reward.claimed
      }));
      setPendingRewards(transformedRewards);
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
    }
  };

  // Calculate total DOPAMINE earned
  const fetchTotalEarned = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dopamine_rewards')
        .select('amount')
        .eq('user_id', user.id)
        .eq('claimed', true);

      if (error) {
        console.error('Error fetching total earned:', error);
        return;
      }

      const total = data?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
      setTotalDopamineEarned(total);
    } catch (error) {
      console.error('Error calculating total earned:', error);
    }
  };

  // Update task streak
  const updateTaskStreak = async (taskType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_task_streak', {
        task_type_param: taskType
      });

      if (error) {
        console.error('Error updating task streak:', error);
        return;
      }

      // Check for new weekly rewards
      await checkWeeklyRewards();
      
      // Refresh data
      await fetchTaskStreaks();
      await fetchPendingRewards();
    } catch (error) {
      console.error('Error updating task streak:', error);
    }
  };

  // Check for weekly rewards
  const checkWeeklyRewards = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('check_weekly_rewards');

      if (error) {
        console.error('Error checking weekly rewards:', error);
      }
    } catch (error) {
      console.error('Error checking weekly rewards:', error);
    }
  };

  // Claim reward
  const claimReward = async (rewardId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('dopamine_rewards')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
          // In a real implementation, you would include the transaction hash
          transaction_hash: 'mock_tx_' + Date.now()
        })
        .eq('id', rewardId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error claiming reward:', error);
        throw error;
      }

      // Refresh data
      await fetchPendingRewards();
      await fetchTotalEarned();
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTaskStreaks();
      fetchPendingRewards();
      fetchTotalEarned();
    }
  }, [user]);

  return {
    taskStreaks,
    pendingRewards,
    totalDopamineEarned,
    isLoading,
    updateTaskStreak,
    claimReward,
    checkWeeklyRewards
  };
};