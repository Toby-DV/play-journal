import { AttackComponent } from "./AttackComponent";

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
    effects: [{ kind: "status", effectId: "slow", target: "target", durationMs: 2500, magnitude: 0.2 }],
  },
  {
    id: "unstoppable_slash",
    name: "Unstoppable Slash",
    cooldownMs: 2000,
    effects: [{ kind: "status", effectId: "unstoppable", target: "self", durationMs: 2000}],
  },
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
