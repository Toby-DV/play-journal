import Dungeon from "@mikewesthad/dungeon";

// Shared alias so every dungeon module refers to the same room type instead of each redeclaring
// `Dungeon["rooms"][number]` locally.
export type DungeonRoom = Dungeon["rooms"][number];

// Special room types the dungeon can assign beyond plain rooms. Extend this union to add new
// kinds - then register a matching RoomSpawnStrategy with EnemySpawner and give it a quota in
// assignRoomKinds' callers.
export type RoomKind = "boss" | "swarm";
