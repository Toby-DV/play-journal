import StatusEffectController from "./StatusEffectController";
import Health from "./Health";

export interface StatusEffectComponent {
  kind: "status";
  effectId: string;
  target: "self" | "target";
  durationMs: number;
  // Overrides the effect definition's default magnitude (StatusEffect.ts) - lets attacks like
  // puncture vs. slowing_attack share the "slow" effect at different strengths.
  magnitude?: number;
}

export interface DamageComponent {
  kind: "damage";
  target: "self" | "target";
  amount?: number;
}

export type AttackComponent = StatusEffectComponent | DamageComponent;

export interface ResolvableEntity {
  statusEffects: StatusEffectController;
  health: Health;
}

// Anything that can fight or be fought also needs a known position for range calculations
export interface CombatEntity extends ResolvableEntity {
  x: number;
  y: number;
}

export interface AggressiveCombatEntity extends CombatEntity {
  aggressionLevel: number;
}

export function resolveAttackComponents(
  components: AttackComponent[],
  self: ResolvableEntity,
  target: ResolvableEntity | null,
  fallbackDamage: number
): void {
  for (const component of components) {
    const recipient = component.target === "self" ? self : target;
    if (!recipient) continue;

    if (component.kind === "damage") {
      recipient.health.takeDamage(component.amount ?? fallbackDamage);
    } else {
      recipient.statusEffects.apply(component.effectId, component.durationMs, component.magnitude);
    }
  }
}
