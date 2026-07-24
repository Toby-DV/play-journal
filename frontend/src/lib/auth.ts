"use client";

const NAME_KEY = "play_journal_display_name";

export function getDisplayName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function setDisplayName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
}

export function hasProfile(): boolean {
  return !!getDisplayName();
}
