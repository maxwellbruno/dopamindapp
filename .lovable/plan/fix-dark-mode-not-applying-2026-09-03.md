# Fix Dark Mode Not Applying

## Root cause (confirmed by code reads)
- The toggle works: `SettingsCard.tsx` and `App.tsx` correctly add/remove the `dark` class on `<html>`, and `tailwind.config.ts` has `darkMode: ["class"]`.
- The problem is the app's color tokens: `tailwind.config.ts` defines Dopamind colors as **static hex values** (`deep-blue: '#1E3A8A'`, `light-gray: '#F3F4F6'`, etc.). These never change when `.dark` is applied.
- The app overwhelmingly uses these static classes — `bg-light-gray` on page wrappers, `text-deep-blue` everywhere, and custom classes in `index.css` (`body`, `.dopamind-card`, inputs) that use `@apply bg-light-gray text-deep-blue bg-white`.
- Only the semantic tokens (`--background`, `--card`, etc.) have `.dark` overrides in `index.css` — and almost nothing in the app uses them.

## Fix plan
1. **`tailwind.config.ts`**: point the Dopamind palette at the CSS variables instead of hex literals — `deep-blue: 'hsl(var(--deep-blue))'`, `light-gray: 'hsl(var(--light-gray))'`, and the same for `card-white`, `text-dark`, `text-light`, `cool-gray`, `pure-white`.
2. **`src/index.css`**:
   - Add a `.dark` override block redefining those palette variables (dark navy/slate background, light blue-tinted text, dark card surfaces) so every existing `bg-light-gray` / `text-deep-blue` usage flips automatically.
   - Add dark-safe rules for the custom classes that use `@apply` with static colors: `body`, `.dopamind-card` (and its hover), and the input classes — e.g. under `.dark`, `.dopamind-card` gets a dark card background with light text.
3. **Verify**: toggle Dark mode in Profile settings with Playwright, screenshot key pages (Home, Track, Profile) in both modes to confirm backgrounds, cards, and text all switch.

## Notes
- No changes to the toggle logic or settings storage — those already work.
- Tailwind's `hsl(var(--x))` mapping keeps light mode visually identical to today.
