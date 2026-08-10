export type WeaponCategory = "melee" | "longMelee";

export interface Weapon {
  id: string;
  category: WeaponCategory;
  damage: number;
  attackSpeedMs: number;
  rangeTiles: number;
  // Multiplier on Enemy's KNOCKBACK_SPEED. 0 disables the shove for this weapon entirely.
  knockback: number;
  attackIds: string[];
}

export const WEAPONS: Weapon[] = [
  {
    id: "tobys_sword",
    category: "melee",
    damage: 25,
    attackSpeedMs: 1000,
    rangeTiles: 4.5,
    knockback: 1,
    attackIds: ["slowing_attack", "unstoppable_slash", "short_dash"],
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
