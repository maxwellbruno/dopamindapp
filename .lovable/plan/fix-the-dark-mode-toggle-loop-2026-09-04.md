# Fix the Dark Mode Toggle Loop

## Confirmed issue
- `Profile` creates a new default settings object on every render and passes it to `useLocalStorage`.
- That makes the hook's `readValue` callback change on every render, so its synchronization effect repeatedly writes a newly parsed settings object into state.
- `SettingsCard` mirrors every new settings object into `tempSettings`, producing the reported maximum-update-depth loop and disrupting the Dark Mode interaction.
- Theme application is also duplicated across `App`, `Profile`, and `SettingsCard`, allowing those effects to compete while the user edits the toggle.

## Fix
1. Move the Profile settings defaults to a stable module-level constant so `useLocalStorage` no longer resynchronizes on every render.
2. Make `SettingsCard` synchronize its draft only when editing begins or when persisted settings meaningfully change, rather than on every object identity change.
3. Keep temporary theme preview in `SettingsCard`, but leave persisted/global theme application to the app-level effect so Save and Cancel behave predictably.
4. Verify with an eligible Pro/Elite state that Edit → Dark Mode → Save applies and persists dark mode, Cancel restores the saved theme, and the console no longer reports a maximum-update-depth warning.

## Scope
Only the theme settings state flow and its validation will change; no other Profile features or styling will be modified.
