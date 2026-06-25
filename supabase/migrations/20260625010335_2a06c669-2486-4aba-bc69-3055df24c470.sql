
-- Application status enum
DO $$ BEGIN
  CREATE TYPE public.therapist_application_status AS ENUM ('draft','submitted','kyc_pending','kyc_passed','kyc_failed','approved','rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE public.therapist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  title TEXT NOT NULL,
  credentials TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  years_of_experience INT NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  languages TEXT NOT NULL,
  price_range TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  session_types TEXT[] NOT NULL DEFAULT '{}',
  linkedin_url TEXT,
  profile_picture_path TEXT NOT NULL,
  license_document_path TEXT NOT NULL,
  government_id_path TEXT NOT NULL,
  additional_document_path TEXT,
  kyc_selfie_path TEXT NOT NULL,
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  status public.therapist_application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.therapist_applications TO authenticated;
GRANT ALL ON public.therapist_applications TO service_role;

ALTER TABLE public.therapist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own applications"
  ON public.therapist_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own applications"
  ON public.therapist_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own draft applications"
  ON public.therapist_applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_therapist_applications_updated_at
  BEFORE UPDATE ON public.therapist_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies: private bucket "therapist-documents", scoped to <user_id>/...
CREATE POLICY "Therapist docs - user read own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapist docs - user upload own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapist docs - user update own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapist docs - user delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
