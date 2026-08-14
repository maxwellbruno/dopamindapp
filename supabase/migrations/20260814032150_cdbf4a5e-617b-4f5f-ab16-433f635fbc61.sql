-- 1. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Applications: Persona + review stage
ALTER TYPE public.therapist_application_status ADD VALUE IF NOT EXISTS 'pending_review';

ALTER TABLE public.therapist_applications
  ADD COLUMN IF NOT EXISTS persona_inquiry_id text,
  ADD COLUMN IF NOT EXISTS persona_status text,
  ADD COLUMN IF NOT EXISTS persona_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

ALTER TABLE public.therapist_applications ALTER COLUMN kyc_selfie_path DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS therapist_applications_persona_inquiry_idx
  ON public.therapist_applications (persona_inquiry_id) WHERE persona_inquiry_id IS NOT NULL;

CREATE POLICY "Admins view all applications" ON public.therapist_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.therapist_applications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Therapists directory
CREATE TABLE public.therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  application_id uuid REFERENCES public.therapist_applications(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  title text NOT NULL,
  credentials text NOT NULL,
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  languages text NOT NULL DEFAULT '',
  specialties text[] NOT NULL DEFAULT '{}',
  session_types text[] NOT NULL DEFAULT '{}',
  years_of_experience integer NOT NULL DEFAULT 0,
  avatar_url text,
  rate_cents_per_30min integer NOT NULL DEFAULT 1000 CHECK (rate_cents_per_30min >= 1000),
  payout_wallet_address text,
  is_published boolean NOT NULL DEFAULT true,
  is_accepting_clients boolean NOT NULL DEFAULT true,
  score numeric NOT NULL DEFAULT 60 CHECK (score >= 0 AND score <= 100),
  rating_avg numeric NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  completed_sessions integer NOT NULL DEFAULT 0,
  cancelled_sessions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.therapists TO anon;
GRANT SELECT, INSERT, UPDATE ON public.therapists TO authenticated;
GRANT ALL ON public.therapists TO service_role;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views published therapists" ON public.therapists
  FOR SELECT USING (is_published OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Therapists update own profile" ON public.therapists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage therapists" ON public.therapists
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Bookings
CREATE TABLE public.therapist_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  therapist_user_id uuid NOT NULL,
  client_user_id uuid NOT NULL,
  scheduled_start timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes >= 30 AND duration_minutes % 30 = 0),
  amount_cents integer NOT NULL CHECK (amount_cents >= 1000),
  platform_fee_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_payment',
  session_mode text NOT NULL DEFAULT 'video',
  daily_room_name text,
  daily_room_url text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.therapist_bookings TO authenticated;
GRANT ALL ON public.therapist_bookings TO service_role;
ALTER TABLE public.therapist_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view bookings" ON public.therapist_bookings
  FOR SELECT TO authenticated USING (auth.uid() = client_user_id OR auth.uid() = therapist_user_id);
CREATE POLICY "Clients create bookings" ON public.therapist_bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_user_id);
CREATE POLICY "Participants update bookings" ON public.therapist_bookings
  FOR UPDATE TO authenticated USING (auth.uid() = client_user_id OR auth.uid() = therapist_user_id)
  WITH CHECK (auth.uid() = client_user_id OR auth.uid() = therapist_user_id);
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.therapist_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Escrow ledger
CREATE TABLE public.escrow_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.therapist_bookings(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL,
  therapist_user_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  therapist_payout_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  status text NOT NULL DEFAULT 'awaiting_deposit',
  deposit_tx_hash text,
  payout_tx_hash text,
  refund_tx_hash text,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.escrow_payments TO authenticated;
GRANT ALL ON public.escrow_payments TO service_role;
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view escrow" ON public.escrow_payments
  FOR SELECT TO authenticated USING (auth.uid() = client_user_id OR auth.uid() = therapist_user_id);
CREATE TRIGGER update_escrow_updated_at BEFORE UPDATE ON public.escrow_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Session messages
CREATE TABLE public.session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.therapist_bookings(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  recipient_user_id uuid NOT NULL,
  body text,
  voice_note_path text,
  voice_note_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.session_messages TO authenticated;
GRANT ALL ON public.session_messages TO service_role;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view messages" ON public.session_messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_user_id OR auth.uid() = recipient_user_id);
CREATE POLICY "Participants send messages" ON public.session_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;

-- 7. Reviews, likes, reports
CREATE TABLE public.therapist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.therapist_bookings(id) ON DELETE SET NULL,
  client_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, client_user_id)
);
GRANT SELECT ON public.therapist_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapist_reviews TO authenticated;
GRANT ALL ON public.therapist_reviews TO service_role;
ALTER TABLE public.therapist_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views reviews" ON public.therapist_reviews FOR SELECT USING (true);
CREATE POLICY "Clients write reviews for completed sessions" ON public.therapist_reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = client_user_id AND EXISTS (
      SELECT 1 FROM public.therapist_bookings b
      WHERE b.id = booking_id AND b.client_user_id = auth.uid() AND b.status = 'completed'
    )
  );
CREATE POLICY "Clients edit own reviews" ON public.therapist_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = client_user_id) WITH CHECK (auth.uid() = client_user_id);
CREATE POLICY "Clients delete own reviews" ON public.therapist_reviews
  FOR DELETE TO authenticated USING (auth.uid() = client_user_id);
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.therapist_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.therapist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (therapist_id, user_id)
);
GRANT SELECT ON public.therapist_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.therapist_likes TO authenticated;
GRANT ALL ON public.therapist_likes TO service_role;
ALTER TABLE public.therapist_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views likes" ON public.therapist_likes FOR SELECT USING (true);
CREATE POLICY "Users like therapists" ON public.therapist_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own likes" ON public.therapist_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.therapist_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.therapist_reports TO authenticated;
GRANT ALL ON public.therapist_reports TO service_role;
ALTER TABLE public.therapist_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters view own reports" ON public.therapist_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users file reports" ON public.therapist_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);

-- 8. Score recomputation
CREATE OR REPLACE FUNCTION public.recompute_therapist_score(_therapist_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r_avg numeric; r_count integer; l_count integer; c_done integer; c_cancel integer; open_reports integer; s numeric;
BEGIN
  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO r_avg, r_count FROM public.therapist_reviews WHERE therapist_id = _therapist_id;
  SELECT COUNT(*) INTO l_count FROM public.therapist_likes WHERE therapist_id = _therapist_id;
  SELECT COUNT(*) FILTER (WHERE status = 'completed'), COUNT(*) FILTER (WHERE status = 'cancelled')
    INTO c_done, c_cancel FROM public.therapist_bookings WHERE therapist_id = _therapist_id;
  SELECT COUNT(*) INTO open_reports FROM public.therapist_reports WHERE therapist_id = _therapist_id AND status = 'open';

  s := 50
     + CASE WHEN r_count > 0 THEN (r_avg - 3) * 8 ELSE 0 END
     + LEAST(15, c_done * 0.5)
     + LEAST(10, l_count * 0.5)
     - LEAST(20, CASE WHEN (c_done + c_cancel) > 0 THEN (c_cancel::numeric / (c_done + c_cancel)) * 20 ELSE 0 END)
     - LEAST(30, open_reports * 10);

  UPDATE public.therapists
    SET rating_avg = ROUND(r_avg, 2), rating_count = r_count, likes_count = l_count,
        completed_sessions = c_done, cancelled_sessions = c_cancel,
        score = GREATEST(0, LEAST(100, ROUND(s, 1)))
    WHERE id = _therapist_id;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_recompute_therapist_score()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_therapist_score(COALESCE(NEW.therapist_id, OLD.therapist_id));
  RETURN NULL;
END; $$;

CREATE TRIGGER reviews_score AFTER INSERT OR UPDATE OR DELETE ON public.therapist_reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_therapist_score();
CREATE TRIGGER likes_score AFTER INSERT OR DELETE ON public.therapist_likes
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_therapist_score();
CREATE TRIGGER reports_score AFTER INSERT OR UPDATE ON public.therapist_reports
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_therapist_score();
CREATE TRIGGER bookings_score AFTER UPDATE OF status ON public.therapist_bookings
  FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_therapist_score();