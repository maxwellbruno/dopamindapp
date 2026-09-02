CREATE TABLE public.shower_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  shower_type text NOT NULL,
  duration_minutes integer NOT NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shower_entries TO authenticated;
GRANT ALL ON public.shower_entries TO service_role;
ALTER TABLE public.shower_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own shower entries" ON public.shower_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_shower_entries_user_date ON public.shower_entries (user_id, date DESC);