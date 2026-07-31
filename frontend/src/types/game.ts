export interface GameConfig {
  length_of_day: number; // 1 - 10, scales dungeon room count
  theme_id: string; // keys into lib/theme.ts's palette map
  theme_name: string;
  player_sprite: string;
  enemy_type: string;
  enemy_color: string; // per-theme hex; no longer tints sprites now that enemies ship real art
  mood: string; // keys into lib/moodTint.ts
  game_rules: string[];
  bosses: string[];
  weapon: string; // flavor text only - actual combat weapon is randomly generated per run
  weapon_no: number
}
