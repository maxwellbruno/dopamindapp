import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMoodEntries from "./tools/list-mood-entries";
import getMoodEntry from "./tools/get-mood-entry";
import createMoodEntry from "./tools/create-mood-entry";
import deleteMoodEntry from "./tools/delete-mood-entry";
import listFocusSessions from "./tools/list-focus-sessions";
import createFocusSession from "./tools/create-focus-session";
import getFocusStats from "./tools/get-focus-stats";
import getProfile from "./tools/get-profile";
import listWallet from "./tools/list-wallet";
import searchTherapists from "./tools/search-therapists";
import getTherapist from "./tools/get-therapist";

// Build the OAuth issuer from the Supabase project ref inlined at build time by
// Vite. Never read runtime env at module top level — this file is evaluated
// both during manifest extraction and at Edge Function cold start where the
// request env is not yet available.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mindfulnest-mcp",
  title: "Mindfulnest",
  version: "0.1.0",
  instructions:
    "Tools for Mindfulnest — a mental wellness app. Read and log the signed-in user's mood entries and focus sessions, view their profile, streaks, and wallet, and search the therapist directory.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMoodEntries,
    getMoodEntry,
    createMoodEntry,
    deleteMoodEntry,
    listFocusSessions,
    createFocusSession,
    getFocusStats,
    getProfile,
    listWallet,
    searchTherapists,
    getTherapist,
  ],
});
