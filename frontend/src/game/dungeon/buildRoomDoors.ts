import type Phaser from "phaser";
import Door from "./Door";
import TILE_MAPPING from "../tileMapping";
import { DungeonRoom } from "./types";

// Builds a door which can be (visually) opened and closed. 
export default function buildRoomDoors(stuffLayer: Phaser.Tilemaps.TilemapLayer, room: DungeonRoom): Door[] {
  return room.getDoorLocations().map((door) => {
    const isHorizontalWall = door.y === 0 || door.y === room.height - 1;
    const closedTileIndex = isHorizontalWall
      ? TILE_MAPPING.DOOR.CLOSED.HORIZONTAL
      : TILE_MAPPING.DOOR.CLOSED.VERTICAL;
    return new Door(stuffLayer, room.x + door.x, room.y + door.y, closedTileIndex);
  });
}
