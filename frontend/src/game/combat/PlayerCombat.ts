import { LineOfSightBlocker } from "./lineOfSight";
import { Weapon } from "../data/weapons";
import { WEAPON_ATTACKS, BASIC_ATTACK } from "../data/weaponAttacks";
import { AttackComponent, CombatEntity, DelayedAttack, resolveAttackComponents } from "./AttackComponent";
import CooldownTracker from "./CooldownTracker";
import { TILE_SIZE } from "../constants";
import { AttackDefinition } from "../data/enemyAttacks";
import { NONE } from "phaser";
import { findNearestTarget } from "./TargetFinders";

export interface AttackInput {
  isBasicAttackJustPressed(): boolean;
  isAbilityJustPressed(slot: 0 | 1 | 2): boolean;
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
    if (this.self.statusEffects.has("stunned") || this.self.statusEffects.has("suppressed")) {
      this.pendingResolution = []; 
      return;
    }

    if (this.input.isBasicAttackJustPressed()) this.tryBasicAttack();
    for (const slot of [0, 1, 2] as const) {
      if (this.input.isAbilityJustPressed(slot)) this.tryAbility(slot);
    }

    const remainingAttacks: DelayedAttack[] = [];
    this.pendingResolution = this.pendingResolution.filter((attack) => {
      attack.remainingMs -= deltaMs;
      if (attack.remainingMs > 0) return true;
      const target = this.findTarget();
      const pending = this.resolveEffects(attack.effects, target);
      if (pending) remainingAttacks.push(pending);
      return false;
    }).concat(remainingAttacks);
    
  }

  get cooldownTracker(): CooldownTracker {
    return this.cooldowns;
  }

  get pendingAttacks(): DelayedAttack[] {
    return this.pendingResolution;
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
    if (!attackId || this.self.statusEffects.has("suppressed")) return;
    if (!this.cooldowns.isReady(attackId)) return;

    const definition = WEAPON_ATTACKS.find((a) => a.id === attackId);
    if (!definition) return;

    this.cooldowns.start(attackId, definition.cooldownMs);

    const requiresTarget = definition.effects.some((component) => component.target === "target");
    const target = requiresTarget ? this.findTarget() : null;
    // if (requiresTarget && !target) return;
    const pending = this.resolveEffects(definition.effects, target);
    if (pending) this.pendingResolution.push(pending);
    this.options.onAttack?.(attackId);
  }

  // Runs immediate effects and returns a DelayedAttack for delayed ones
  private resolveEffects(effects: AttackComponent[], target: CombatEntity | null): DelayedAttack | null {
    const instantEffects: AttackComponent[] = [];
    const delayedEffects: AttackComponent[] = [];
    let delayMs: number = 0;
    let pastDelay = false;
    for (const effect of effects) {
      if (effect.kind === "delay" && !pastDelay) {
        pastDelay = true;
        delayMs = effect.durationMs;
        continue;
      }
      (pastDelay ? delayedEffects : instantEffects).push(effect);
    }

    resolveAttackComponents(instantEffects, this.self, target, this.weapon.damage, this.dashBlocker, {
      knockback: this.weapon.knockback,
    });
    if (delayedEffects.length > 0) {
      return ({
        effects: delayedEffects,
        modifiers: { knockback: this.weapon.knockback },
        remainingMs: delayMs || 0
      })
    }
  return null;
  }
}
