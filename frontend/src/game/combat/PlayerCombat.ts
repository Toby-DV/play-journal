import { LineOfSightBlocker, hasLineOfSight } from "./lineOfSight";
import { Weapon } from "../data/weapons";
import { WEAPON_ATTACKS, BASIC_ATTACK } from "../data/weaponAttacks";
import { CombatEntity, DelayedAttack, resolveAttackComponents } from "./AttackComponent";
import CooldownTracker from "./CooldownTracker";
import { TILE_SIZE } from "../constants";

export interface AttackInput {
  isBasicAttackJustPressed(): boolean;
  isAbilityJustPressed(slot: 0 | 1 | 2): boolean;
}

function findNearestTarget(
  self: CombatEntity,
  enemies: CombatEntity[],
  maxRangeWorldUnits: number,
  blocker: LineOfSightBlocker
): CombatEntity | null {
  let nearest: CombatEntity | null = null;
  let nearestDistance = Infinity;

  for (const enemy of enemies) {
    const distance = Math.hypot(enemy.x - self.x, enemy.y - self.y);
    if (distance > maxRangeWorldUnits) continue;
    if (!hasLineOfSight(blocker, self.x, self.y, enemy.x, enemy.y)) continue;
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export default class PlayerCombat {
  private cooldowns = new CooldownTracker();
  private pendingResolution: DelayedAttack[] = [];

  constructor(
    private weapon: Weapon,
    private self: CombatEntity,
    private getEnemies: () => CombatEntity[],
    private blocker: LineOfSightBlocker,
    private dashBlocker: LineOfSightBlocker,
    private input: AttackInput,
    private options: { onAttack?: (attackId: string) => void } = {}
  ) {}

  private findTarget(): CombatEntity | null {
    return findNearestTarget(this.self, this.getEnemies(), this.weapon.rangeTiles * TILE_SIZE, this.blocker);
  }

  update(deltaMs: number): void {
    this.cooldowns.tick(deltaMs);
    if (this.self.statusEffects.has("stunned")) { this.pendingResolution = []; return }

    if (this.input.isBasicAttackJustPressed()) this.tryBasicAttack();
    for (const slot of [0, 1, 2] as const) {
      if (this.input.isAbilityJustPressed(slot)) this.tryAbility(slot);
    }

    this.pendingResolution = this.pendingResolution.filter((attack) => {
      attack.remainingMs -= deltaMs;
      if (attack.remainingMs > 0) return true;
      const target = this.findTarget();
      resolveAttackComponents(attack.effects, this.self, target, this.weapon.damage, this.dashBlocker, attack.modifiers);
      return false;
    });
    
  }

  get cooldownTracker(): CooldownTracker {
    return this.cooldowns;
  }

  private tryBasicAttack(): void {
    if (!this.cooldowns.isReady(BASIC_ATTACK.id)) return;
    this.cooldowns.start(BASIC_ATTACK.id, this.weapon.attackSpeedMs);

    const target = this.findTarget();
    if (!target) return;
    resolveAttackComponents(BASIC_ATTACK.effects, this.self, target, this.weapon.damage, this.dashBlocker, {
      knockback: this.weapon.knockback,
    });
    this.options.onAttack?.(BASIC_ATTACK.id);
  }

  private tryAbility(slot: 0 | 1 | 2): void {
    const attackId = this.weapon.attackIds[slot];
    if (!attackId) return;
    if (!this.cooldowns.isReady(attackId)) return;

    const definition = WEAPON_ATTACKS.find((a) => a.id === attackId);
    if (!definition) return;

    this.cooldowns.start(attackId, definition.cooldownMs);

    const requiresTarget = definition.effects.some((component) => component.target === "target");
    const target = requiresTarget ? this.findTarget() : null;
    // if (requiresTarget && !target) return;

    const instantEffects = definition.effects.filter((e) => !("resolveLast" in e) || !e.resolveLast);
    const delayedEffects = definition.effects.filter((e) => ("resolveLast" in e) && !!e.resolveLast);
    const timeUntilDone = resolveAttackComponents(instantEffects, this.self, target, this.weapon.damage, this.dashBlocker, {
      knockback: this.weapon.knockback,
    });
    if (delayedEffects.length > 0) {
      this.pendingResolution?.push({
        effects: delayedEffects,
        modifiers: { knockback: this.weapon.knockback },
        remainingMs: timeUntilDone || 0
      })
    }
    this.options.onAttack?.(attackId);
  }
}
