import { AttackComponent } from "../combat/AttackComponent";

export interface WeaponAttackDefinition {
  id: string;
  name: string;
  cooldownMs: number;
  effects: AttackComponent[];
}

export const WEAPON_ATTACKS: WeaponAttackDefinition[] = [
  {
    id: "slowing_attack",
    name: "Slowing attack",
    cooldownMs: 5000,
    effects: [{kind: "status", effectId: "slow", durationMs: 2500, magnitude: 0.2, targetFinder: {kind: "radius", rangeTiles: 2.5, aoe: false}}, 
              // {kind: "damage", target: "target"}
    ],
  },
  {
    id: "test_attack",
    name: "Test Attack",
    cooldownMs: 2000,
    effects: [
      // {kind: "status", effectId: "cleanse", durationMs: 200, targetFinder: {kind: "self"}}
      {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 3, aoe: true}}
    ]
  },
  {
    id: "unstoppable_slash",
    name: "Unstoppable Slash",
    cooldownMs: 2000,
    // effects: [{kind: "status", effectId: "stunned", target: "self", durationMs: 2000, resolveLast: true}]
    effects: [
      {kind: "dash", target: "self", distanceTiles: 2.8, durationMs: 220},
      {kind: "delay", target: "self", durationMs: 220},
      // {kind: "damage", target: "target"},
      // {kind: "status", effectId: "channeling", target: "self", durationMs: 100},
      ]
  },
  {
    id: "speed_buff",
    name: "Speed Up",
    cooldownMs: 7000,
    // effects:[{kind: "status", effectId: "speed", magnitude: 1.2, target: "self", durationMs: 4000}]
    effects: []
  },
  {
    id: "short_dash",
    name: "Short Dash",
    cooldownMs: 2000,
    effects: [{kind: "dash", target: "self", distanceTiles: 2, durationMs: 80},
              {kind: "delay", target: "self", durationMs: 80},
              // {kind: "status", target: "target", effectId: "slow", durationMs: 800, magnitude: 0.4},
              // {kind: "damage", target: "target"}
    ]
  }
];

// Damage undefined - PlayerCombat resolves it against the wielder's weapon.damage
export const BASIC_ATTACK: WeaponAttackDefinition = {
  id: "basic_attack",
  name: "Basic Attack",
  cooldownMs: 0, // unused - PlayerCombat gates this by weapon.attackSpeedMs instead
  effects: [
    {kind: "damage", targetFinder: {kind: "radius", rangeTiles: 2.5, aoe: false}},
  ],
};
