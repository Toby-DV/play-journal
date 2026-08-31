import type Phaser from "phaser";

export default class Door {
  private opened = true;

  constructor(
    private readonly layer: Phaser.Tilemaps.TilemapLayer,
    private readonly tileX: number,
    private readonly tileY: number,
    private readonly closedTileIndex: number
  ) {}

  get isOpen(): boolean {
    return this.opened;
  }

  open(): void {
    if (this.opened) return;
    this.opened = true;
    this.layer.removeTileAt(this.tileX, this.tileY);
  }

  close(): void {
    if (!this.opened) return;
    this.opened = false;
    this.layer.putTileAt(this.closedTileIndex, this.tileX, this.tileY);
  }
}
