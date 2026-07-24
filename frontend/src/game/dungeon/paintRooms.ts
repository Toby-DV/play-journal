import type Phaser from "phaser";
import type Dungeon from "@mikewesthad/dungeon";
import TILE_MAPPING from "../tileMapping";
import { DungeonRoom } from "./types";

// Paints every generated room onto the ground layer: floor, corners, walls,
// and door openings punched through at the room's connection points.
export function paintRooms(groundLayer: Phaser.Tilemaps.TilemapLayer, dungeon: Dungeon) {
  dungeon.rooms.forEach((room) => {
    const { x, y, width, height, left, right, top, bottom } = room;

    // Floor: mostly clean tiles, occasionally a dirty one
    groundLayer.weightedRandomize(TILE_MAPPING.FLOOR, x, y, width, height);

    // Room corners
    groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_LEFT, left, top);
    groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_RIGHT, right, top);
    groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_RIGHT, right, bottom);
    groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_LEFT, left, bottom);

    // Walls: mostly clean tiles, occasionally a dirty one
    groundLayer.weightedRandomize(TILE_MAPPING.WALL.TOP, left + 1, top, width - 2, 1);
    groundLayer.weightedRandomize(TILE_MAPPING.WALL.BOTTOM, left + 1, bottom, width - 2, 1);
    groundLayer.weightedRandomize(TILE_MAPPING.WALL.LEFT, left, top + 1, 1, height - 2);
    groundLayer.weightedRandomize(TILE_MAPPING.WALL.RIGHT, right, top + 1, 1, height - 2);

    // Doors punch through the wall at the room's connection points to its neighbors
    for (const door of room.getDoorLocations()) {
      if (door.y === 0) {
        groundLayer.putTilesAt(TILE_MAPPING.DOOR.TOP, x + door.x - 1, y + door.y);
      } else if (door.y === room.height - 1) {
        groundLayer.putTilesAt(TILE_MAPPING.DOOR.BOTTOM, x + door.x - 1, y + door.y);
      } else if (door.x === 0) {
        groundLayer.putTilesAt(TILE_MAPPING.DOOR.LEFT, x + door.x, y + door.y - 1);
      } else if (door.x === room.width - 1) {
        groundLayer.putTilesAt(TILE_MAPPING.DOOR.RIGHT, x + door.x, y + door.y - 1);
      }
    }
  });
}

// Places the stairs at the center of the given room and clears collision on that tile so it's
// walkable.
export function placeStairs(map: Phaser.Tilemaps.Tilemap, stuffLayer: Phaser.Tilemaps.TilemapLayer, room: DungeonRoom) {
  stuffLayer.putTileAt(TILE_MAPPING.STAIRS, room.centerX, room.centerY);
  stuffLayer.setCollision(TILE_MAPPING.STAIRS, false);
  return {
    x: map.tileToWorldX(room.centerX)!,
    y: map.tileToWorldY(room.centerY)!,
  };
}
