import { LineOfSightBlocker, hasLineOfSight } from "./lineOfSight";
import { CombatEntity } from "./AttackComponent";

export type TargetFinder = RadiusDefinition

export interface RadiusDefinition {
    radiusWorldUnits: number,
    // TODO: add offset option
}

export function findNearestTarget(
  self: CombatEntity,
  enemies: CombatEntity[],
  maxRangeWorldUnits: number,
  blocker: LineOfSightBlocker | null
): CombatEntity | null {
  const inRange = inRadius(self, enemies, maxRangeWorldUnits, blocker);
  return inRange[0] ?? null;
}

function inRadius(
    self: CombatEntity,
    enemies: CombatEntity[],
    maxRangeWorldUnits: number,
    blocker: LineOfSightBlocker | null,
): CombatEntity[] {
    const inRange: {entity: CombatEntity, distance: number}[] = []
    for (const enemy of enemies) {
        const distance = Math.hypot(enemy.x - self.x, enemy.y - self.y);
        if (distance > maxRangeWorldUnits) continue;
        if (blocker && !hasLineOfSight(blocker, self.x, self.y, enemy.x, enemy.y)) continue;
        inRange.push({entity: enemy, distance: distance});
    }
    return inRange.sort((a, b) => a.distance - b.distance).map(({entity}) => entity)
}