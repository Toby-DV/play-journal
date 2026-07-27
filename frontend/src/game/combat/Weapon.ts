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
    id: "tobysSword",
    category: "melee",
    damage: 20,
    attackSpeedMs: 1000,
    rangeTiles: 3,
    attackIds: ["slowing_attack"],
  },
  {
    id: "shortsword",
    category: "melee",
    damage: 15,
    attackSpeedMs: 500,
    rangeTiles: 1.5,
    attackIds: ["quick_slash"],
  },
  {
    id: "rapier",
    category: "melee",
    damage: 15,
    attackSpeedMs: 500,
    rangeTiles: 1.5,
    attackIds: ["puncture", "quick_slash"],
  },
  {
    id: "warhammer",
    category: "melee",
    damage: 15,
    attackSpeedMs: 500,
    rangeTiles: 1.5,
    attackIds: ["heavy_strike", "power_swing"],
  },
  {
    id: "spear",
    category: "longMelee",
    damage: 10,
    attackSpeedMs: 800,
    rangeTiles: 3,
    attackIds: ["puncture"],
  },
  {
    id: "polearm",
    category: "longMelee",
    damage: 10,
    attackSpeedMs: 800,
    rangeTiles: 3,
    attackIds: ["intimidating_strike", "battle_focus"],
  },
  {
    id: "greatsword",
    category: "longMelee",
    damage: 10,
    attackSpeedMs: 800,
    rangeTiles: 3,
    attackIds: ["heavy_strike", "power_swing", "battle_focus"],
  },
];
