# Brain Nutrition selections + Brain Supplements log

## What users get

In the Meals tab of the Track page:

1. **Brain Nutrition** section gains three multi-select chip groups (in addition to the existing brain-food rating):
   - Brain Foods: Fatty fish, Eggs, Avocado, Nuts and seeds, Berries, Leafy greens, Beans/lentils, Whole grains, Other nutrient-dense foods
   - Brain Herbs: Turmeric, Ginger, Rosemary, Basil, Cinnamon, Peppermint, Other herbs
   - Relaxation & Wellness Teas: Chamomile, Peppermint, Ginger, Green tea, Rooibos, Hibiscus, Other herbal teas

   Each "Other…" chip reveals a small text input so the user can name their own item. Selections show as tags on each meal in the Recent Meals list.

2. **Brain Supplements** — a new section below Brain Nutrition with its own "Log Supplement" form and history list. Fields:
   - Supplement name (required)
   - Brand (optional)
   - Amount (e.g. "500 mg", "2 capsules")
   - Time taken (time picker, defaults to now)
   - Frequency (Once, Daily, Twice daily, Weekly, As needed)

## Technical notes

**Database (one migration):**
- Add to `public.meal_entries`: `brain_foods text[] default '{}'`, `brain_herbs text[] default '{}'`, `wellness_teas text[] default '{}'` — nullable-safe defaults so existing rows stay valid.
- New table `public.supplement_entries`: `id`, `user_id`, `name`, `brand`, `amount`, `taken_at timestamptz`, `frequency`, `note`, `created_at`. Grants for `authenticated` + `service_role`, RLS enabled, single owner-only policy on `auth.uid() = user_id` (mirrors the other tracker tables).

**Frontend:**
- `src/components/meals/MealTracker.tsx`: add the three chip groups (shared small `ChipGroup` sub-component), "Other" free-text handling, extend the `MealEntry` type and the `onLog` payload, render selected tags in the history rows.
- New `src/components/meals/SupplementTracker.tsx`: form + recent list, same card styling as the other trackers.
- `src/pages/Mood.tsx`: extend the meal query/mutation with the new columns, add a `supplement_entries` query and insert mutation, render `<SupplementTracker />` under `<MealTracker />` in the Meals tab.

No changes outside the Meals tab.
