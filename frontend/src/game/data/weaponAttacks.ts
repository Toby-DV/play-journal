import { AttackComponent } from "../combat/AttackComponent";

export interface WeaponAttackDefinition {
  id: string;
  name: string;
  description: string;
  cooldownMs: number;
  icon?: string;
  effects: AttackComponent[];
}

export const WEAPON_ATTACKS: WeaponAttackDefinition[] = [
  {
    id: "test_ability",
    name: "Dash",
    icon: "dash-icon",
    description: "Dash in the direction you were moving.",
    cooldownMs: 2000,
    effects: [
      {kind: "dash", target: "self", distanceTiles: 3, durationMs: 200}
    ]
  },
  {
    id: "slowing_attack",
    name: "Slowing attack",
    description: "Deal extra damage and slow your enemy.",
    cooldownMs: 5000,
    effects: [
        {kind: "status", effectId: "slow", durationMs: 2500, magnitude: 0.2, targetFinder: {kind: "radius", rangeTiles: 2.5, aoe: false}},
        {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 2.5, aoe: false}},
    ],
  },
  {
    id: "shockwave",
    name: "Shockwave",
    description: "Plunge your sword into the ground emitting a shockwave that damages and stuns nearby enemies.",
    icon: "shockwave-icon",
    cooldownMs: 2000,
    effects: [
      {kind: "status", effectId: "casting_rooted", durationMs: 500, targetFinder: {kind: "self"}},
      {kind: "delay", durationMs: 500},
      {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 3, aoe: true, ignoreWalls: true}},
      {kind: "status", targetFinder: {kind: "radius", rangeTiles: 3, aoe: true, ignoreWalls: true}, effectId: "stunned", durationMs: 700}
    ]
  },
  {
    id: "ground_pound",
    name: "Ground Pound",
    description: "Leap forwards and deal damage in an area",
    cooldownMs: 3000,
    effects: [
      {kind: "dash", target: "self", distanceTiles: 3, durationMs: 300},
      {kind: "delay", durationMs: 400},
      {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 1.7, aoe: true}},
    ]
  },
  {
    id: "cleanse",
    name: "Cleanse",
    description: "Cleanse yourself of effects",
    cooldownMs: 6000,
    effects: [
      {kind: "status", effectId: "cleanse", durationMs: 200, targetFinder: {kind: "self"}}
    ]
  },
  {
    id: "unstoppable_slash",
    name: "Unstoppable Slash",
    description: "Become unstoppable for a short duration",
    cooldownMs: 2000,
    effects: [
      {kind: "dash", target: "self", distanceTiles: 2.8, durationMs: 220},
      {kind: "delay", durationMs: 220},
      // {kind: "damage", target: "target"},
      // {kind: "status", effectId: "channeling", target: "self", durationMs: 100},
      ]
  },
  {
    id: "speed_buff",
    name: "Speed Up",
    description: "Become speedy for a duration",
    cooldownMs: 7000,
    // effects:[{kind: "status", effectId: "speed", magnitude: 1.2, target: "self", durationMs: 4000}]
    effects: []
  },
  {
    id: "short_dash",
    name: "Short Dash",
    description: "Dash in the direction you were moving",
    cooldownMs: 2000,
    effects: [{kind: "dash", target: "self", distanceTiles: 2, durationMs: 150},
              {kind: "delay", durationMs: 150},
              {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 3, aoe: true}},
    ]
  }
];

// Damage undefined - PlayerCombat resolves it against the wielder's weapon.damage
export const BASIC_ATTACK: WeaponAttackDefinition = {
  id: "basic_attack",
  name: "Basic Attack",
  description: "Basic attack - damages one enemy",
  cooldownMs: 0, // unused - PlayerCombat gates this by weapon.attackSpeedMs instead
  effects: [
    {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 2.5, aoe: false}},
  ],
};
