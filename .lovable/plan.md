# Admin dashboard for therapist applications

Give your account (maxwellbruno52@gmail.com) a private admin area for reviewing therapist applications, tracking activity, and managing listed therapists. Nobody else can see or open it.

## Current state

- A basic review page already exists at `/admin/therapist-applications`, gated by an admin role check.
- The roles table currently has no rows at all, so no account is admin yet — that's why nothing admin-related shows for you today.

## What gets built

### 1. Make your account admin
Add an admin role row for maxwellbruno52@gmail.com so the admin area unlocks for you only.

### 2. Admin dashboard page (`/admin`)
- Overview cards: total applications, pending review, approved therapists, listed/unlisted therapists, completed sessions, and platform fees earned.
- Links into the two management sections below.
- Entry point in Profile: replace the current "Therapist applications" button with "Admin dashboard" (still only rendered for admins).

### 3. Applications review (`/admin/therapist-applications`, upgraded)
- Tabs: Pending, Approved, Rejected, All, with counts.
- Search by name or email.
- Each application shows credentials, license, KYC status, bio, and secure links to headshot, license, ID and certifications.
- Approve (creates/lists the therapist profile), Reject with an optional note saved to the application, and re-open a rejected application.

### 4. Therapist management (`/admin/therapists`)
- List of all therapist profiles with score, rating, likes, completed/cancelled sessions and published status.
- Toggle a profile between listed and unlisted.
- View reports filed against a therapist and mark a report as reviewed or dismissed.

### 5. Access control
- All three pages check the admin role and show an "Admins only" message otherwise.
- Database rules updated so only admins can read all applications, update application status/notes, update therapist publish status, and read/update reports. Everyone else keeps their current access.

## Technical notes

- Migration: insert admin role for the user's id; add admin RLS policies using the existing `has_role(auth.uid(),'admin')` function for `therapist_applications` (select/update all), `therapists` (select/update all), `therapist_reports` (select/update all). No schema changes beyond policies.
- New files: `src/pages/AdminDashboard.tsx`, `src/pages/AdminTherapists.tsx`, `src/components/admin/AdminGuard.tsx`, `src/hooks/useAdminStats.ts`.
- Rework `src/pages/AdminTherapistApplications.tsx` for tabs/search/notes, reusing the existing approve logic and signed URLs from the `therapist-documents` bucket.
- Add `/admin` and `/admin/therapists` routes in `src/App.tsx`; update the Profile entry point.
- All new UI uses existing design tokens with dark-mode-safe classes.
