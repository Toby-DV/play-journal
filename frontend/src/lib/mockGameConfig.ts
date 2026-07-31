import { GameConfig } from "@/types/game";

export const mockGameConfig: GameConfig = {
  theme_id: "coder_coffee",
  theme_name: "Coder's Coffee Chase",
  player_sprite: "sliced_knight",
  enemy_type: "skeleton",
  enemy_color: "#ef4444",
  mood: "reflective",
  game_rules: [
    "Use the ARROW keys to move.",
    "Press SPACE to attack nearby enemies.",
    "Clear every room to reach the stairs.",
  ],
  bosses: ["The Merge Conflict", "Big John"],
  weapon: "Mechanical Keyboard",
  length_of_day: 8,
  weapon_no: 1,
};
