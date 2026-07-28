import { GameConfig } from "@/types/game";

// Mood keyword lexicon -> lib/moodTint.ts and lib/theme.ts both key off these four moods.
const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ["happy", "great", "excited", "fun", "joy", "love", "amazing", "wonderful", "celebrat", "proud", "laugh"],
  reflective: ["tired", "sad", "cry", "lonely", "miss", "quiet", "calm", "thought", "remember", "rain", "alone"],
  productive: ["finished", "work", "deadline", "project", "code", "build", "ship", "task", "meeting", "study", "done"],
};

const DEFAULT_MOOD = "balanced";

const MOOD_THEMES: Record<
  string,
  { theme_id: string; theme_name: string; bosses: string[]; weapons: string[]; enemy_color: string }
> = {
  happy: {
    theme_id: "party_star",
    theme_name: "Festival of Sparks",
    bosses: ["The Confetti King", "Big Grin"],
    weapons: ["Party Popper", "Glowstick"],
    enemy_color: "#ec4899",
  },
  reflective: {
    theme_id: "rainy_day",
    theme_name: "The Quiet Hours",
    bosses: ["The Hollow Echo", "Old Rain"],
    weapons: ["Umbrella Blade", "Worn Locket"],
    enemy_color: "#60a5fa",
  },
  productive: {
    theme_id: "coder_coffee",
    theme_name: "Coder's Coffee Chase",
    bosses: ["The Merge Conflict", "Big John"],
    weapons: ["Mechanical Keyboard", "Debug Wand"],
    enemy_color: "#ef4444",
  },
  balanced: {
    theme_id: "daily_quest",
    theme_name: "An Ordinary Quest",
    bosses: ["The Routine", "Clockwork Warden"],
    weapons: ["Worn Sword", "Traveler's Staff"],
    enemy_color: "#d97706",
  },
};

const GAME_RULES = [
  "Use ARROW keys or WASD to move.",
  "Press SPACE to attack nearby enemies.",
  "Clear every room to reach the stairs.",
];

// Placeholder art only for now - both ids resolve through LocalSpriteProvider's local manifests
// (see game/animation/SpriteProvider.ts).
const PLAYER_SPRITE = "sliced_knight";
const ENEMY_TYPE = "bug";

function detectMood(text: string): string {
  const lower = text.toLowerCase();
  let bestMood = DEFAULT_MOOD;
  let bestScore = 0;
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const score = keywords.filter((word) => lower.includes(word)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }
  return bestMood;
}

// Longer entries generate longer dungeons
function estimateLengthOfDay(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(10, Math.max(1, Math.round(wordCount / 15)));
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Deterministic mood detection with no network call. 
// Placeholder sprites only for now.
export function generateGameConfig(text: string): GameConfig {
  const mood = detectMood(text);
  const theme = MOOD_THEMES[mood];

  return {
    length_of_day: estimateLengthOfDay(text),
    theme_id: theme.theme_id,
    theme_name: theme.theme_name,
    player_sprite: PLAYER_SPRITE,
    enemy_type: ENEMY_TYPE,
    enemy_color: theme.enemy_color,
    mood,
    game_rules: GAME_RULES,
    bosses: [pick(theme.bosses)],
    weapon: pick(theme.weapons),
    weapon_no: 0 // TODO change at some point
  };
}
