import type { VignetteOptions } from "@/game/effects/vignette";

export interface MoodTint {
  color: number;
  alpha: number;
  blendMode: "NORMAL" | "ADD" | "MULTIPLY" | "SCREEN";
  vignette: VignetteOptions | null;
  confetti: boolean;
  rain: boolean;
}

const MOOD_TINTS: Record<string, MoodTint> = {
  productive: { color: 0x38bdf8, alpha: 0.12, blendMode: "NORMAL", vignette: null, confetti: false, rain: false }, // cool, crisp
  happy: {
    color: 0xfacc15,
    alpha: 0.07,
    blendMode: "ADD",
    vignette: { key: "vignette-warm", rgb: [255, 196, 61], maxAlpha: 0.15, blendMode: "ADD" },
    confetti: false,
    rain: false,
  },
  reflective: {
    color: 0x1e3a5f,
    alpha: 0.32,
    blendMode: "MULTIPLY",
    vignette: { key: "vignette-dark", rgb: [0, 0, 0], maxAlpha: 0.85, blendMode: "NORMAL" },
    confetti: false,
    rain: true,
  },
  balanced: { color: 0x94a3b8, alpha: 0.05, blendMode: "NORMAL", vignette: null, confetti: false, rain: false }, // neutral
};

const DEFAULT_TINT: MoodTint = {
  color: 0x000000,
  alpha: 0,
  blendMode: "NORMAL",
  vignette: null,
  confetti: false,
  rain: false,
};

export function getMoodTint(mood: string): MoodTint {
  return MOOD_TINTS[mood] ?? DEFAULT_TINT;
}

const MOOD_BACKGROUNDS: Record<string, string> = {
  productive: "#3a2be6", // slate-900, cool and crisp
  happy: "#03aca9", // rose-900, lighter warm celebratory base to sit under the gold tint/vignette
  reflective: "#172554", // blue-950, moody
  balanced: "#018023", // emerald-950, neutral
};

const DEFAULT_BACKGROUND = "#0f172a";

export function getMoodBackground(mood: string): string {
  return MOOD_BACKGROUNDS[mood] ?? DEFAULT_BACKGROUND;
}
