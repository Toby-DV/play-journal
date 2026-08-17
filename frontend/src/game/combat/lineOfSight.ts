import { TILE_SIZE } from "../constants";

export interface LineOfSightBlocker {
  isBlocked(x: number, y: number): boolean;
}

export function isWithinRange(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  maxRangeWorldUnits: number
): boolean {
  return Math.hypot(toX - fromX, toY - fromY) <= maxRangeWorldUnits;
}

export function hasLineOfSight(
  blocker: LineOfSightBlocker,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): boolean {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const steps = Math.ceil(Math.hypot(dx, dy) / (TILE_SIZE / 4));

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (blocker.isBlocked(fromX + dx * t, fromY + dy * t)) return false;
  }

  return true;
}

export function sweepUntilBlocked(
  blocker: LineOfSightBlocker,
  fromX: number,
  fromY: number,
  toX: number, 
  toY: number
) : {x: number, y: number} {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const steps = Math.ceil(Math.hypot(dx, dy) / (TILE_SIZE / 8));
  let clearX = fromX;
  let clearY = fromY;
  // Endpoint included, unlike hasLineOfSight - stopping inside a wall is what this prevents
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = fromX + dx * t
    const y = fromY + dy * t
    if (blocker.isBlocked(x, y)) break;
    clearX = x;
    clearY = y;
  }
  return {x: clearX, y: clearY}
}