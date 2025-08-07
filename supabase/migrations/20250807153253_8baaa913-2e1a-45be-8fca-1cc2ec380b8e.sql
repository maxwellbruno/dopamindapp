-- Create table for tracking user task streaks
CREATE TABLE public.user_task_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL, -- 'ai_chat', 'focus_session', 'breathing_exercise', 'mood_entry'
  current_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, task_type)
);

-- Create table for DOPAMINE token rewards
CREATE TABLE public.dopamine_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL, -- 'weekly_streak_ai_chat', 'weekly_streak_focus', etc.
  amount INTEGER NOT NULL, -- DOPAMINE tokens amount
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, reward_type, week_start_date)
);

-- Create table for user wallets
CREATE TABLE public.user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  wallet_address TEXT,
  privy_did TEXT,
  wallet_provider TEXT DEFAULT 'privy', -- 'privy', 'external'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_task_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dopamine_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_task_streaks
CREATE POLICY "Users can view their own task streaks" 
ON public.user_task_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own task streaks" 
ON public.user_task_streaks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task streaks" 
ON public.user_task_streaks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for dopamine_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.dopamine_rewards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
ON public.dopamine_rewards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" 
ON public.dopamine_rewards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_wallets
CREATE POLICY "Users can view their own wallet" 
ON public.user_wallets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
ON public.user_wallets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" 
ON public.user_wallets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update task streak
CREATE OR REPLACE FUNCTION public.update_task_streak(
  task_type_param TEXT,
  completion_date DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_streak RECORD;
  new_streak INTEGER;
BEGIN
  -- Get existing streak data
  SELECT * INTO existing_streak 
  FROM public.user_task_streaks 
  WHERE user_id = current_user_id AND task_type = task_type_param;
  
  IF existing_streak IS NULL THEN
    -- First time completing this task
    INSERT INTO public.user_task_streaks (
      user_id, task_type, current_streak, last_completed_date, total_completions
    ) VALUES (
      current_user_id, task_type_param, 1, completion_date, 1
    );
  ELSE
    -- Check if this is a consecutive day
    IF existing_streak.last_completed_date = completion_date - INTERVAL '1 day' THEN
      -- Continue streak
      new_streak := existing_streak.current_streak + 1;
    ELSIF existing_streak.last_completed_date = completion_date THEN
      -- Same day, don't update streak but increment total
      new_streak := existing_streak.current_streak;
    ELSE
      -- Streak broken, restart
      new_streak := 1;
    END IF;
    
    UPDATE public.user_task_streaks 
    SET 
      current_streak = new_streak,
      last_completed_date = completion_date,
      total_completions = total_completions + 1,
      updated_at = now()
    WHERE user_id = current_user_id AND task_type = task_type_param;
  END IF;
END;
$$;

-- Create function to check and create weekly rewards
CREATE OR REPLACE FUNCTION public.check_weekly_rewards()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
  week_end DATE := week_start + INTERVAL '6 days';
  streak_record RECORD;
BEGIN
  -- Check each task type for 7-day streaks
  FOR streak_record IN 
    SELECT task_type, current_streak 
    FROM public.user_task_streaks 
    WHERE user_id = current_user_id AND current_streak >= 7
  LOOP
    -- Create reward if not already exists for this week
    INSERT INTO public.dopamine_rewards (
      user_id, reward_type, amount, week_start_date, week_end_date
    ) VALUES (
      current_user_id, 
      'weekly_streak_' || streak_record.task_type,
      CASE 
        WHEN streak_record.task_type = 'ai_chat' THEN 100
        WHEN streak_record.task_type = 'focus_session' THEN 150
        WHEN streak_record.task_type = 'breathing_exercise' THEN 75
        WHEN streak_record.task_type = 'mood_entry' THEN 50
        ELSE 25
      END,
      week_start,
      week_end
    ) ON CONFLICT (user_id, reward_type, week_start_date) DO NOTHING;
  END LOOP;
END;
$$;