import { describe, it, expect } from "vitest";
import { resolveAttackComponents, AttackComponent, CombatEntity } from "@/game/combat/AttackComponent";
import StatusEffectController from "@/game/combat/StatusEffectController";
import Health from "@/game/combat/Health";
import { LineOfSightBlocker } from "@/game/combat/lineOfSight";

function makeEntity(): CombatEntity {
  return { statusEffects: new StatusEffectController(), health: new Health(100), x: 0, y: 0 };
}

const neverBlocks: LineOfSightBlocker = { isBlocked: () => false };

describe("resolveAttackComponents", () => {
  it("applies a self-targeted status effect to self, not target", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [{ kind: "status", effectId: "unstoppable", target: "self", durationMs: 1000 }];

    resolveAttackComponents(components, self, target, 0, neverBlocks);

    expect(self.statusEffects.has("unstoppable")).toBe(true);
    expect(target.statusEffects.has("unstoppable")).toBe(false);
  });

  it("applies a target-targeted status effect to target, not self", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [{ kind: "status", effectId: "slow", target: "target", durationMs: 1000 }];

    resolveAttackComponents(components, self, target, 0, neverBlocks);

    expect(target.statusEffects.has("slow")).toBe(true);
    expect(self.statusEffects.has("slow")).toBe(false);
  });

  it("deals its own explicit damage amount to the target", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [{ kind: "damage", target: "target", amount: 12 }];

    resolveAttackComponents(components, self, target, 999, neverBlocks);

    expect(target.health.getRatio()).toBe(0.88);
  });

  it("falls back to the provided fallback damage when amount is omitted", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [{ kind: "damage", target: "target" }];

    resolveAttackComponents(components, self, target, 20, neverBlocks);

    expect(target.health.getRatio()).toBe(0.8);
  });

  it("deals damage to self when the component targets self", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [{ kind: "damage", target: "self", amount: 10 }];

    resolveAttackComponents(components, self, target, 0, neverBlocks);

    expect(self.health.getRatio()).toBe(0.9);
    expect(target.health.getRatio()).toBe(1);
  });

  it("skips a target-directed component when there is no target", () => {
    const self = makeEntity();
    const components: AttackComponent[] = [{ kind: "damage", target: "target", amount: 10 }];

    expect(() => resolveAttackComponents(components, self, null, 0, neverBlocks)).not.toThrow();
    expect(self.health.getRatio()).toBe(1);
  });

  it("resolves multiple components in order", () => {
    const self = makeEntity();
    const target = makeEntity();
    const components: AttackComponent[] = [
      { kind: "damage", target: "target", amount: 10 },
      { kind: "status", effectId: "slow", target: "target", durationMs: 1000 },
    ];

    resolveAttackComponents(components, self, target, 0, neverBlocks);

    expect(target.health.getRatio()).toBe(0.9);
    expect(target.statusEffects.has("slow")).toBe(true);
  });
});
