## Problem

Binaural Frequencies, Brainwaves, Guided Meditation, and AI Soundscape pages read subscription state from `localStorage` (`dopamind_subscription` key) via `useLocalStorage`. This key is never populated by the real subscription system, so `isElite` is always `false` — even for genuine Elite subscribers. The rest of the app (e.g. `RequireTier`) correctly uses the `useSubscription` hook backed by the `subscriptions` table.

## Fix

Replace the `useLocalStorage` subscription stub in each of these pages with the shared `useSubscription()` hook (source of truth used everywhere else):

- `src/pages/BinauralFrequencies.tsx`
- `src/pages/Brainwaves.tsx`
- `src/pages/GuidedMeditation.tsx`
- `src/pages/AISoundscape.tsx`

In each file:
1. Remove the local `SubscriptionData` interface and `useLocalStorage(...)` call.
2. Import and call `useSubscription()` to get `isElite` (and `isLoading` where needed to avoid a flash of the upgrade screen while data loads).
3. Keep the existing "Elite Exclusive" upgrade UI, but drive it from `isElite` from the hook.
4. Preserve all other page behavior (lists, navigation, etc.).

No database, RLS, or subscription-logic changes are needed — the `subscriptions` row for your account is already `elite/active`.
