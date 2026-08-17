import StatusEffectController from "./StatusEffectController";
import Health from "./Health";
import { TILE_SIZE } from "../constants";
import { sweepUntilBlocked, LineOfSightBlocker } from "./lineOfSight";

export interface StatusEffectComponent {
  kind: "status",
  effectId: string,
  target: "self" | "target",
  durationMs: number,
  magnitude?: number,
  resolveLast?: Boolean,
}

export interface DamageComponent {
  kind: "damage",
  target: "self" | "target",
  amount?: number,
  resolveLast?: Boolean,
}

export interface DashComponent {
  kind: "dash",
  target: "self",
  distanceTiles: number,
  durationMs: number,
  resolveLast?: Boolean
}

export interface HitInfo {
  damage: number,
  dirX: number,
  dirY: number,
  knockback: number,
}

export type AttackComponent = StatusEffectComponent | DamageComponent | DashComponent;

export interface CombatEntity {
  statusEffects: StatusEffectController,
  health: Health,
  x: number,
  y: number,
  facingX?: number,
  facingY?: number,
  onDamaged?(hit: HitInfo): void;
  dash?: (dirX: number, dirY: number, speed: number, durationMs: number) => void;
}

export interface DelayedAttack {
  effects: AttackComponent[],
  modifiers: {knockback?: number},
  remainingMs: number
}

export interface AggressiveCombatEntity extends CombatEntity {
  aggressionLevel: number,
}

export function resolveAttackComponents( // Also returns how long an action will take
  components: AttackComponent[],
  self: CombatEntity,
  target: CombatEntity | null,
  fallbackDamage: number,
  dashBlocker: LineOfSightBlocker,
  modifiers: { knockback?: number } = {},
): number | undefined {
  let effectDurationMs: number | undefined;
  for (const component of components) {
    const recipient = component.target === "self" ? self : target;
    if (!recipient) continue;
    
    if (component.kind === "dash") {
      const dirX = self.facingX ?? 1;
      const dirY = self.facingY ?? 0;
      const distanceTiles = component.distanceTiles;
      const intended = TILE_SIZE * distanceTiles
      const speed = (distanceTiles * TILE_SIZE) / (component.durationMs / 1000)
      const stop = sweepUntilBlocked(dashBlocker, self.x, self.y, self.x + dirX * intended, self.y + dirY * intended)
      // Speed is held constant and the duration clipped, so a blocked dash slams rather than glides
      const durationMs = (Math.hypot(stop.x - self.x, stop.y - self.y) / speed) * 1000
      self.dash?.(dirX, dirY, speed, durationMs);
      effectDurationMs = durationMs;
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
  return effectDurationMs;
}
