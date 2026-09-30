import { GameConfig } from "@/types/game";

export const mockGameConfig: GameConfig = {
  theme_id: "coder_coffee",
  player_sprite: "sliced_knight",
  enemy_type: "bat",
  mood: "balanced",
  game_rules: [
    "Use the ARROW keys to move.",
    "Press SPACE to attack nearby enemies.",
    "Clear every room to reach the stairs.",
  ],
  bosses: ["The Merge Conflict", "Big John"],
  length_of_day: 8,
  weapon_no: 0,
};
