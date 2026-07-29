// Tracks whether the level-start tutorial has ever been shown, so it only greets
// first-time players. Deliberately separate from settings.ts - it's a one-way
// progress flag, not something the settings menu exposes.

const STORAGE_KEY = "play_journal_tutorial_seen";

export function hasSeenTutorial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTutorialSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage full or unavailable; the tutorial just shows again next run.
  }
}
