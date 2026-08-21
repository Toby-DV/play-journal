import StatusEffectController from "./StatusEffectController";
import Health from "./Health";
import { TILE_SIZE } from "../constants";
import { sweepUntilBlocked, LineOfSightBlocker } from "./lineOfSight";
import { resolveTarget, TargetFinder } from "./TargetFinders";
import { Console } from "console";

export interface StatusEffectComponent {
  kind: "status",
  effectId: string,
  // target: "self" | "target",
  durationMs: number,
  targetFinder: TargetFinder,
  magnitude?: number,
}

export interface DelayComponent {
  kind: "delay",
  target: "self",
  durationMs: number,
}

export interface DamageComponent {
  kind: "damage",
  // target: "self" | "target",
  targetFinder: TargetFinder,
  amount?: number,
}

export interface DashComponent {
  kind: "dash",
  target: "self",
  distanceTiles: number,
  durationMs: number,
}

export interface HitInfo {
  damage: number,
  dirX: number,
  dirY: number,
  knockback: number,
}

export type AttackComponent = StatusEffectComponent | DamageComponent | DashComponent | DelayComponent;

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
  enemies: CombatEntity[],
  fallbackDamage: number,
  blocker: LineOfSightBlocker,
  dashBlocker: LineOfSightBlocker,
  modifiers: { knockback?: number } = {},
): number | undefined {
  let effectDurationMs: number = 0;
  console.log(`resolveAttackComponents called ${Array.from(components, (component) => `${component.kind}`)})}`);
  
  for (const component of components) {
    
    if (component.kind === "dash") {
      const dirX = self.facingX ?? 1;
      const dirY = self.facingY ?? 0;
      const distanceTiles = component.distanceTiles;
      const intended = TILE_SIZE * distanceTiles
      const speed = (distanceTiles * TILE_SIZE) / (component.durationMs / 1000)
      const stop = sweepUntilBlocked(dashBlocker, self.x, self.y, self.x + dirX * intended, self.y + dirY * intended)
      const durationMs = (Math.hypot(stop.x - self.x, stop.y - self.y) / speed) * 1000
      self.dash?.(dirX, dirY, speed, durationMs);
      effectDurationMs += durationMs;
    } 
    
    else if (component.kind === "damage") {
      const recipients = resolveTarget(self, enemies, component.targetFinder, blocker)
      const amount = component.amount ?? fallbackDamage;
      console.log(`Enemies: ${recipients}`)
      for (const recipient of recipients) {
        recipient.health.takeDamage(amount);
        const dx = recipient.x - self.x;
        const dy = recipient.y - self.y;
        const len = Math.hypot(dx, dy) || 1; // guard against self-targeting abilities being 0
        recipient.onDamaged?.({
          damage: amount,
          dirX: dx / len,
          dirY: dy / len,
          knockback: modifiers.knockback ?? 1,
        });
      }
    }
    
    else if (component.kind === "status") {
      const recipients = resolveTarget(self, enemies, component.targetFinder, blocker)
      for (const recipient of recipients){
        recipient.statusEffects.apply(component.effectId, component.durationMs, component.magnitude);
      }
    }

    else if (component.kind === "delay") {
      effectDurationMs += component.durationMs;
    }
  }
  return effectDurationMs;
}
