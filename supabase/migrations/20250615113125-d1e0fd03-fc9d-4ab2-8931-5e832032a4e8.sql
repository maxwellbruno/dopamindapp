
-- Create a table for focus sessions
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration INT NOT NULL, -- duration in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for focus_sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own focus sessions"
  ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
  ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a table for user stats
CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_focus_minutes INT NOT NULL DEFAULT 0,
    total_sessions INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    last_session_date DATE
);

-- Add RLS for user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stats"
    ON public.user_stats FOR ALL USING (auth.uid() = user_id);

-- Function to create user_stats entry for a new user
CREATE OR REPLACE FUNCTION public.create_user_stats_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user_stats on new user signup
CREATE TRIGGER on_auth_user_created_create_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_stats_for_new_user();

-- Function to update stats after a session
CREATE OR REPLACE FUNCTION public.update_user_stats_on_session_complete(session_duration INT)
RETURNS void AS $$
DECLARE
    today DATE := CURRENT_DATE;
    last_day DATE;
    current_streak_val INT;
BEGIN
    SELECT last_session_date, current_streak INTO last_day, current_streak_val FROM public.user_stats WHERE user_id = auth.uid();

    IF last_day IS NULL THEN
        current_streak_val := 1;
    ELSIF last_day = today - INTERVAL '1 day' THEN
        current_streak_val := current_streak_val + 1;
    ELSIF last_day < today - INTERVAL '1 day' THEN
        current_streak_val := 1;
    END IF;

    UPDATE public.user_stats
    SET
        total_focus_minutes = total_focus_minutes + session_duration,
        total_sessions = total_sessions + 1,
        current_streak = current_streak_val,
        last_session_date = today
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Function to get all stats for focus page
CREATE TYPE public.focus_stats AS (
    total_sessions INT,
    total_focus_minutes INT,
    current_streak INT,
    today_sessions_count INT
);

CREATE OR REPLACE FUNCTION public.get_user_focus_stats()
RETURNS public.focus_stats AS $$
DECLARE
    stats public.focus_stats;
    user_stats_row public.user_stats;
BEGIN
    -- Ensure user stats row exists
    INSERT INTO public.user_stats (user_id) VALUES (auth.uid()) ON CONFLICT (user_id) DO NOTHING;

    -- Get user stats
    SELECT * INTO user_stats_row FROM public.user_stats WHERE user_id = auth.uid();
    stats.total_sessions := user_stats_row.total_sessions;
    stats.total_focus_minutes := user_stats_row.total_focus_minutes;
    stats.current_streak := user_stats_row.current_streak;

    -- Get today's sessions count
    SELECT count(*) INTO stats.today_sessions_count FROM public.focus_sessions
    WHERE user_id = auth.uid() AND created_at >= date_trunc('day', now() at time zone 'utc');

    RETURN stats;
END;
$$ LANGUAGE plpgsql;
