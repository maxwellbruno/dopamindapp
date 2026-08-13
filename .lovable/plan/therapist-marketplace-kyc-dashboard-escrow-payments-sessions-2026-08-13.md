# Therapist Marketplace: KYC, Dashboard, Escrow Payments, Sessions & Reputation

Build the full therapist marketplace in three phases. Escrow uses a Dopamind-controlled custodial wallet on Base (USDC), KYC uses Persona, and live sessions use Daily.co for voice/video.

## Phase 1 — Persona KYC + manual approval + therapist dashboard

**Applicant flow**
- The application form keeps collecting profile info and documents (license, certifications, government ID), but the manual selfie upload is replaced by a "Verify identity with Persona" step.
- Clicking it opens Persona's hosted verification flow. When Persona finishes, the application moves to `kyc_passed` or `kyc_failed` automatically via a Persona webhook (not client-reported status).
- Once KYC passes, the application enters `pending_review`: an admin manually checks licenses and certifications, then approves or rejects.

**Approval outcome**
- Approved applications create a public therapist profile (replacing the current hardcoded sample list, which becomes seed data) and unlock a Therapist Dashboard at `/therapist`.
- Dashboard shows: verification/approval status, editable profile and rate, upcoming and past sessions, earnings and payouts, reviews, and score.

**Admin review**
- A protected `/admin/therapist-applications` page listing submissions with document previews and approve/reject actions, gated by an `admin` role in a dedicated `user_roles` table.

## Phase 2 — Booking, crypto escrow, 15% platform fee

- Therapists set their own rate with a **$10 minimum per 30-minute session**; session lengths in 30-minute increments.
- Clients book a slot, then pay in USDC on Base from their Dopamind wallet to the **platform escrow wallet**.
- Payment is recorded as an escrow ledger entry tied to the booking. Funds are held until the session ends.
- After session end (or an auto-release timer), a scheduled edge function releases **85% to the therapist's wallet** and retains **15% as the Dopamind fee**. Cancellations and no-shows refund the client.
- Therapist dashboard shows pending escrow, released earnings, and payout history.

## Phase 3 — Sessions, reviews, ratings, reports, score

- **Messaging**: realtime 1:1 chat per booking, with voice notes recorded in-browser and stored in a private bucket.
- **Voice/video calls**: Daily.co rooms created per session by an edge function; both parties join from the session page. Room access is time-boxed to the booked slot.
- **Reviews**: after a completed session the client can leave a 1–5 star rating, written review, and a like. Reviews are shown on the therapist profile.
- **Reports**: any client can report a profile; reports land in the admin queue.
- **Score out of 100**: computed from average rating, completed-session volume, response time, cancellation rate, likes, and open reports. Directory sorting defaults to score descending, so higher-scoring therapists appear in "Recommended" at the top.

## Technical notes

**Database (new tables, all with RLS + grants)**
- `user_roles` + `has_role()` security-definer function (admin gating).
- `therapists` — public approved profiles, links to `therapist_applications`, `hourly_rate_cents` (min $10/30min), `payout_wallet_address`, `score`.
- `therapist_bookings` — client, therapist, scheduled start, duration, amount, status.
- `escrow_payments` — booking ref, amount, platform fee, tx hashes, status (`held`, `released`, `refunded`).
- `session_messages` (text + voice-note path) and `therapist_reviews`, `therapist_likes`, `therapist_reports`.
- `therapist_applications` extended with `persona_inquiry_id`, `persona_status`, and `pending_review` / `approved` states.

**Edge functions**
- `persona-webhook` — verifies Persona signature, updates KYC status.
- `persona-create-inquiry` — mints a hosted-flow session for the applicant.
- `book-therapy-session` — validates rate/duration, creates booking + escrow record.
- `release-escrow` — scheduled; sends 85% USDC to therapist, retains 15%.
- `create-daily-room` — issues time-boxed meeting tokens for a booking.
- `recompute-therapist-scores` — scheduled score recalculation.

**Secrets required**
- `PERSONA_API_KEY`, `PERSONA_TEMPLATE_ID`, `PERSONA_WEBHOOK_SECRET`
- `DAILY_API_KEY`
- `PLATFORM_ESCROW_PRIVATE_KEY` and `PLATFORM_ESCROW_ADDRESS` (Base custodial wallet)

I will request these when the relevant phase starts; anything missing leaves that flow in a pending state rather than breaking the app.

**Tier gating (unchanged)**: browsing/booking therapists stays Pro; applying to become a therapist stays Elite.

**Compliance note**: custodial escrow means Dopamind holds client funds — a real-world money-transmission consideration you'll want to review with counsel before going live.
