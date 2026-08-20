import { LineOfSightBlocker, hasLineOfSight } from "./lineOfSight";
import { CombatEntity } from "./AttackComponent";

export type TargetFinder = RadiusDefinition | {kind: "self"}

export interface RadiusDefinition {
    kind: "radius",
    worldUnits: number,
    aoe: Boolean,
    // TODO: add offset option
}

export function resolveTarget(
    self: CombatEntity,
    enemies: CombatEntity[],
    targetFinder: TargetFinder,
    blocker: LineOfSightBlocker
) : CombatEntity[] | null {
    let inRange: CombatEntity[] = []
    if (targetFinder.kind === "self") {return [self]}

    else if (targetFinder.kind === "radius") {
        const shapeCheck = inCircle({x: self.x, y: self.y}, targetFinder.worldUnits);
        inRange = filterByShape(self, enemies, blocker, shapeCheck);
        if (!targetFinder.aoe) inRange.slice(0, 1);
    }

    return inRange
}

const inCircle = (origin: {x: number, y: number}, rangeWorldUnits: number) => 
    (enemy: CombatEntity) => ((Math.hypot(enemy.x - origin.x, enemy.y - origin.y) <= rangeWorldUnits))

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

function filterByShape(
    self: CombatEntity,
    enemies: CombatEntity[],
    blocker: LineOfSightBlocker | null,
    inShape: (enemy: CombatEntity) => Boolean
): CombatEntity[] {
    const inRange: {entity: CombatEntity, distance: number}[] = []
    for (const enemy of enemies) {
        const distance = Math.hypot(enemy.x - self.x, enemy.y - self.y);
        if (!inShape(enemy)) continue;
        if (blocker && !hasLineOfSight(blocker, self.x, self.y, enemy.x, enemy.y)) continue;
        inRange.push({entity: enemy, distance: distance});
    }
    return inRange.sort((a, b) => a.distance - b.distance).map(({entity}) => entity)
}