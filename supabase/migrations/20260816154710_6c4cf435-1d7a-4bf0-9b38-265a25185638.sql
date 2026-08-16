
ALTER TABLE public.therapist_applications ALTER COLUMN kyc_selfie_path DROP NOT NULL;

DROP POLICY IF EXISTS "Admins view all applications" ON public.therapist_applications;
CREATE POLICY "Admins view all applications"
ON public.therapist_applications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update applications" ON public.therapist_applications;
CREATE POLICY "Admins update applications"
ON public.therapist_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Therapists view own profile" ON public.therapists;
CREATE POLICY "Therapists view own profile"
ON public.therapists FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Therapist docs - admin read" ON storage.objects;
CREATE POLICY "Therapist docs - admin read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'therapist-documents' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Session media - participants upload" ON storage.objects;
CREATE POLICY "Session media - participants upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'session-media'
  AND EXISTS (
    SELECT 1 FROM public.therapist_bookings b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND (b.client_user_id = auth.uid() OR b.therapist_user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Session media - participants read" ON storage.objects;
CREATE POLICY "Session media - participants read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'session-media'
  AND EXISTS (
    SELECT 1 FROM public.therapist_bookings b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND (b.client_user_id = auth.uid() OR b.therapist_user_id = auth.uid())
  )
);

ALTER TABLE public.session_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
