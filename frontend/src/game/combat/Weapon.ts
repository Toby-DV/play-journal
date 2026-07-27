export type WeaponCategory = "melee" | "longMelee";

export interface Weapon {
  id: string;
  category: WeaponCategory;
  damage: number;
  attackSpeedMs: number;
  rangeTiles: number;
  attackIds: string[];
}

export const WEAPONS: Weapon[] = [
  {
    id: "tobys_sword",
    category: "melee",
    damage: 20,
    attackSpeedMs: 1000,
    rangeTiles: 3,
    attackIds: ["slowing_attack", "unstoppable_slash"],
  },
  {
    id: "shortsword",
    category: "melee",
    damage: 15,
    attackSpeedMs: 500,
    rangeTiles: 1.5,
    attackIds: [],
  }
];
