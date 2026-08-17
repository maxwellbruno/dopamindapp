CREATE TABLE public.water_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_ml integer NOT NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_entries TO authenticated;
GRANT ALL ON public.water_entries TO service_role;
ALTER TABLE public.water_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water entries" ON public.water_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.meal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  meal_type text NOT NULL,
  description text NOT NULL,
  brain_food_rating integer NOT NULL DEFAULT 3,
  note text,
  date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_entries TO authenticated;
GRANT ALL ON public.meal_entries TO service_role;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal entries" ON public.meal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.exercise_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity text NOT NULL,
  duration_minutes integer NOT NULL,
  intensity integer NOT NULL DEFAULT 3,
  note text,
  date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_entries TO authenticated;
GRANT ALL ON public.exercise_entries TO service_role;
ALTER TABLE public.exercise_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exercise entries" ON public.exercise_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);