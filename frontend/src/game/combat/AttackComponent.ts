import StatusEffectController from "./StatusEffectController";
import Health from "./Health";

export interface StatusEffectComponent {
  kind: "status";
  effectId: string;
  target: "self" | "target";
  durationMs: number;
  magnitude?: number;
}

export interface DamageComponent {
  kind: "damage";
  target: "self" | "target";
  amount?: number;
}

export interface HitInfo {
  damage: number;
  dirX: number;
  dirY: number;
  knockback: number;
}

export type AttackComponent = StatusEffectComponent | DamageComponent;

export interface CombatEntity {
  statusEffects: StatusEffectController;
  health: Health;
  x: number;
  y: number;
  // Optional hit reaction - lets sprite-owning entities play feedback without the combat layer knowing about rendering
  onDamaged?(hit: HitInfo): void;
}

export interface AggressiveCombatEntity extends CombatEntity {
  aggressionLevel: number;
}

export function resolveAttackComponents(
  components: AttackComponent[],
  self: CombatEntity,
  target: CombatEntity | null,
  fallbackDamage: number,
  // Per-attack feel modifiers. Optional so enemy attacks and tests, which don't tune feel, can omit it.
  modifiers: { knockback?: number } = {}
): void {
  for (const component of components) {
    const recipient = component.target === "self" ? self : target;
    if (!recipient) continue;

    if (component.kind === "damage") {
      const amount = component.amount ?? fallbackDamage;
      recipient.health.takeDamage(amount);
      const dx = recipient.x - self.x;
      const dy = recipient.y - self.y;
      const len = Math.hypot(dx, dy) || 1; // guard against self-targeting abilities
      recipient.onDamaged?.({
        damage: amount,
        dirX: dx / len,
        dirY: dy / len,
        knockback: modifiers.knockback ?? 1,
      });
    } else {
      recipient.statusEffects.apply(component.effectId, component.durationMs, component.magnitude);
    }
  }
}
