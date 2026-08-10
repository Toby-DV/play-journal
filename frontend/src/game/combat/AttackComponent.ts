import StatusEffectController from "./StatusEffectController";
import Health from "./Health";
import { TILE_SIZE } from "../constants";

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

export interface DashComponent {
  kind: "dash";
  target: "self";
  distanceTiles: number;
  durationMs: number;
}

export interface HitInfo {
  damage: number;
  dirX: number;
  dirY: number;
  knockback: number;
}

export type AttackComponent = StatusEffectComponent | DamageComponent | DashComponent;

export interface CombatEntity {
  statusEffects: StatusEffectController;
  health: Health;
  x: number;
  y: number;
  facingX?: number,
  facingY?: number
  onDamaged?(hit: HitInfo): void;
  dash?: (dirX: number, dirY: number, speed: number, durationMs: number) => void;
}

export interface AggressiveCombatEntity extends CombatEntity {
  aggressionLevel: number;
}

export function resolveAttackComponents(
  components: AttackComponent[],
  self: CombatEntity,
  target: CombatEntity | null,
  fallbackDamage: number,
  modifiers: { knockback?: number } = {}
): void {
  for (const component of components) {
    const recipient = component.target === "self" ? self : target;
    if (!recipient) continue;
    
    if (component.kind === "dash") {
      let dirX = self.facingX ?? 1;
      let dirY = self.facingY ?? 0;
      let durationMs = component.durationMs;
      let distanceTiles = component.distanceTiles;
      self.dash?.(dirX, dirY, (distanceTiles * TILE_SIZE) / (durationMs / 1000), durationMs);
    } 
    
    else if (component.kind === "damage") {
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
    } 
    
    else if (component.kind === "status") {
      recipient.statusEffects.apply(component.effectId, component.durationMs, component.magnitude);
    }
  }
}
