export interface GameConfig {
  length_of_day: number; // 1 - 10, scales dungeon room count
  theme_id: string; // keys into lib/theme.ts's palette map
  player_sprite: string;
  enemy_type: string;
  mood: string; // keys into lib/moodTint.ts
  game_rules: string[];
  bosses: string[];
  weapon_no: number
}
