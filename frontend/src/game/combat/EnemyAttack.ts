import { WeaponAttackDefinition } from "./WeaponAttack";

// An enemy attack is a weapon attack plus AI gating: how aggressive the enemy
// must be to use it, and whether range/line-of-sight constrain it.
export interface AttackDefinition extends WeaponAttackDefinition {
  minAggression: number;
  requiresLineOfSight?: boolean;
  maxRangeTiles?: number;
}

export const ATTACKS: AttackDefinition[] = [
  {
    id: "splash",
    name: "Splash",
    minAggression: 1,
    cooldownMs: 5000,
    effects: [],
    requiresLineOfSight: true,
    maxRangeTiles: 8,
  },
  {
    id: "slowing_attack",
    name: "Slowing Attack",
    minAggression: 2,
    cooldownMs: 4000,
    effects: [
      { kind: "status", effectId: "slow", target: "target", durationMs: 2000, magnitude: 0.5 },
      { kind: "damage", target: "target", amount: 10 },
    ],
    requiresLineOfSight: true,
    maxRangeTiles: 8,
  },
  {
    id: "silencing_glare",
    name: "Silencing Glare",
    minAggression: 3,
    cooldownMs: 6000,
    effects: [
      { kind: "status", effectId: "suppressed", target: "target", durationMs: 2500 },
      { kind: "damage", target: "target", amount: 14 },
    ],
    requiresLineOfSight: true,
    maxRangeTiles: 8,
  },
];
