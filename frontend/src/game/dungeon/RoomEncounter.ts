import Door from "./Door";

// Tile-coordinate rectangle, inclusive on all sides.
export interface TileBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface EncounterHealth {
  readonly isDead: boolean;
}

// Drives combat room doors which close upon first entering and open once the room is clear.
// Callers should always spawn at least one enemy. 
export default class RoomEncounter {
  private triggered = false;
  private cleared = false;

  constructor(
    private readonly interior: TileBounds,
    private readonly doors: readonly Door[],
    private readonly enemies: readonly EncounterHealth[]
  ) {}

  get isCleared(): boolean {
    return this.cleared;
  }

  update(playerTileX: number, playerTileY: number): void {
    if (this.cleared) return;

    if (this.enemies.every((enemy) => enemy.isDead)) {
      this.cleared = true;
      this.doors.forEach((door) => door.open());
      return;
    }

    if (!this.triggered && this.isInsideInterior(playerTileX, playerTileY)) {
      this.triggered = true;
      this.doors.forEach((door) => door.close());
    }
  }

  private isInsideInterior(tileX: number, tileY: number): boolean {
    return (
      tileX >= this.interior.left &&
      tileX <= this.interior.right &&
      tileY >= this.interior.top &&
      tileY <= this.interior.bottom
    );
  }
}
