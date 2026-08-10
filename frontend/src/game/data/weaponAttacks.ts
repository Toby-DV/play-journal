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
    effects: [{kind: "status", effectId: "slow", target: "target", durationMs: 2500, magnitude: 0.2}, 
              {kind: "damage", target: "target"}
    ],
  },
  {
    id: "unstoppable_slash",
    name: "Unstoppable Slash",
    cooldownMs: 2000,
    effects: [{kind: "status", effectId: "unstoppable", target: "self", durationMs: 2000}],
  },
  {
    id: "speed_buff",
    name: "Speed Up",
    cooldownMs: 7000,
    effects:[{kind: "status", effectId: "speed", magnitude: 1.2, target: "self", durationMs: 4000}]
  },
  {
    id: "short_dash",
    name: "Short Dash",
    cooldownMs: 2000,
    effects: [{kind: "dash", target: "self", distanceTiles: 2, durationMs: 60}]
  }
];

// Damage undefined - PlayerCombat resolves it against the wielder's weapon.damage
export const BASIC_ATTACK: WeaponAttackDefinition = {
  id: "basic_attack",
  name: "Basic Attack",
  cooldownMs: 0, // unused - PlayerCombat gates this by weapon.attackSpeedMs instead
  effects: [
    { kind: "damage", target: "target" },
  ],
};
