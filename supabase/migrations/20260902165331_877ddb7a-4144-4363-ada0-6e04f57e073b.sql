ALTER TABLE public.meal_entries
  ADD COLUMN IF NOT EXISTS brain_foods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brain_herbs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS wellness_teas text[] NOT NULL DEFAULT '{}';

CREATE TABLE public.supplement_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  brand text,
  amount text,
  frequency text NOT NULL DEFAULT 'Once',
  taken_at timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplement_entries TO authenticated;
GRANT ALL ON public.supplement_entries TO service_role;

ALTER TABLE public.supplement_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own supplement entries"
  ON public.supplement_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_supplement_entries_user_taken ON public.supplement_entries (user_id, taken_at DESC);