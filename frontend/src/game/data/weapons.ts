export type WeaponCategory = "melee" | "longMelee";

export interface Weapon {
  id: string;
  category: WeaponCategory;
  damage: number;
  attackSpeedMs: number;
  rangeTiles: number;
  knockback: number;  // Multiplier on Enemy's KNOCKBACK_SPEED
  attackIds: string[];
}

export const WEAPONS: Weapon[] = [
  {
    id: "knights_sword",
    category: "melee",
    damage: 25,
    attackSpeedMs: 1000,
    rangeTiles: 2.5,
    knockback: 1,
    attackIds: ["slowing_attack", "shockwave", "test_ability"],
  },
  {
    id: "cannibals_sword",
    category: "melee",
    damage: 18,
    attackSpeedMs: 800,
    rangeTiles: 3,
    knockback: 2,
    attackIds: ["slowing_attack", "unstoppable_slash", "speed_buff"],
  },
  {
    id: "shortsword",
    category: "melee",
    damage: 15,
    attackSpeedMs: 500,
    rangeTiles: 1.5,
    knockback: 0.5,
    attackIds: [],
  }
];
