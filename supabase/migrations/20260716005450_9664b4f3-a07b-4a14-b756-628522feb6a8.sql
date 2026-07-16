
CREATE TABLE public.sleep_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hours NUMERIC(4,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  quality INTEGER NOT NULL CHECK (quality BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_entries TO authenticated;
GRANT ALL ON public.sleep_entries TO service_role;

ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sleep entries"
  ON public.sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
  ON public.sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON public.sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON public.sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX sleep_entries_user_date_idx ON public.sleep_entries (user_id, date DESC);
