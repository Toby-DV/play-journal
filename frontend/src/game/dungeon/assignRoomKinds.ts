import { RoomKind } from "./types";

export interface RoomKindQuota {
  kind: RoomKind;
  count: number;
}

// How many of a dungeon's rooms should get each special kind.
export default function assignRoomKinds<T>(
  rooms: readonly T[],
  quotas: readonly RoomKindQuota[]
): Map<T, RoomKind> {
  const candidates = rooms.slice(1, -1).slice();

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const assignments = new Map<T, RoomKind>();
  let cursor = 0;
  for (const quota of quotas) {
    for (let i = 0; i < quota.count && cursor < candidates.length; i++, cursor++) {
      assignments.set(candidates[cursor], quota.kind);
    }
  }
  return assignments;
}
