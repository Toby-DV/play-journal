import type Phaser from "phaser";
import { prettifyName } from "@/lib/format";
import Enemy from "../entities/Enemy";
import EnemyAI from "../entities/EnemyAI";
import EnemyCombat from "../combat/EnemyCombat";
import EntityLabel from "../ui/EntityLabel";
import { RoomSpawnStrategy, SpawnedEnemy } from "./EnemySpawner";
import { DungeonRoom } from "./types";

const SWARM_MIN_ENEMIES = 3;
const SWARM_MAX_ENEMIES = 6;
const SWARM_ENEMY_HP = 30;
const SWARM_SPEED = 200;
const SWARM_MIN_AGGRESSION = 1;
const SWARM_MAX_AGGRESSION = 2;

const BOSS_HP = 150;
const BOSS_AGGRESSION = 3;
const BOSS_SPRITE_SCALE = 1.4;
// Slower than swarm enemies but sees further
const BOSS_SPEED = 140;
const BOSS_AGGRO_RANGE_TILES = 9;
// Bosses still visibly react to a hit, but don't get shoved around like swarm enemies
const BOSS_KNOCKBACK_SCALE = 0.35;
// Spawn tiles stay x tiles clear of the walls
const SPAWN_WALL_MARGIN = 2;
const SPAWN_ATTEMPTS = 30;

// Returns null when the room is too cluttered/small
function pickSpawnTile(
  room: DungeonRoom,
  stuffLayer: Phaser.Tilemaps.TilemapLayer,
  used: Set<string>
): { x: number; y: number } | null {
  const minX = room.left + SPAWN_WALL_MARGIN;
  const maxX = room.right - SPAWN_WALL_MARGIN;
  const minY = room.top + SPAWN_WALL_MARGIN;
  const maxY = room.bottom - SPAWN_WALL_MARGIN;
  if (minX > maxX || minY > maxY) return null;

  for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
    const x = minX + Math.floor(Math.random() * (maxX - minX + 1));
    const y = minY + Math.floor(Math.random() * (maxY - minY + 1));
    const key = `${x},${y}`;
    if (used.has(key) || stuffLayer.getTileAt(x, y)) continue;
    used.add(key);
    return { x, y };
  }
  return null;
}

// Single placeholder boss
export const spawnBossRoom: RoomSpawnStrategy = ({ scene, map, room, config, bossManifest, fontFamily, getPlayer, blocker }) => {
  const x = map.tileToWorldX(room.centerX)!;
  const y = map.tileToWorldY(room.centerY)!;

  const boss = new Enemy(scene, x, y, config.enemy_color, BOSS_AGGRESSION, BOSS_HP, bossManifest, {
    knockbackScale: BOSS_KNOCKBACK_SCALE,
  });
  boss.sprite.setScale(BOSS_SPRITE_SCALE);

  const label = new EntityLabel(scene, fontFamily, boss.sprite, {
    name: config.bosses[0] ?? `Boss ${prettifyName(config.enemy_type)}`,
    statusEffects: boss.statusEffects,
    health: boss.health,
  });

  const ai = new EnemyAI(boss, getPlayer, blocker, {
    speed: BOSS_SPEED,
    aggroRangeTiles: BOSS_AGGRO_RANGE_TILES,
  });

  const combat = new EnemyCombat(boss, getPlayer, blocker, {
    onAttack: (attackId) => boss.animationController.play("attack", { abilityId: attackId }),
  });

  return [{ enemy: boss, ai, combat, label }];
};

// 3-6 weak, fast enemies scattered across the room. Uses the regular enemy manifest and the same
// door-sealing mechanic as boss rooms (RoomEncounter, via EnemySpawner) - the room seals when the
// player steps in and reopens once the whole swarm is dead.
export const spawnSwarmRoom: RoomSpawnStrategy = ({ scene, map, room, config, enemyManifest, stuffLayer, fontFamily, getPlayer, blocker }) => {
  const count = SWARM_MIN_ENEMIES + Math.floor(Math.random() * (SWARM_MAX_ENEMIES - SWARM_MIN_ENEMIES + 1));
  const used = new Set<string>();
  const spawned: SpawnedEnemy[] = [];

  for (let i = 0; i < count; i++) {
    // Fall back to the room center for the first enemy so a cluttered room still gets a real
    // encounter - a zero-enemy room would count as instantly cleared (see RoomEncounter).
    const tile = pickSpawnTile(room, stuffLayer, used) ?? (i === 0 ? { x: room.centerX, y: room.centerY } : null);
    if (!tile) continue;

    const x = map.tileToWorldX(tile.x)!;
    const y = map.tileToWorldY(tile.y)!;

    const aggressionLevel =
      SWARM_MIN_AGGRESSION + Math.floor(Math.random() * (SWARM_MAX_AGGRESSION - SWARM_MIN_AGGRESSION + 1));
    const enemy = new Enemy(scene, x, y, config.enemy_color, aggressionLevel, SWARM_ENEMY_HP, enemyManifest);

    const label = new EntityLabel(scene, fontFamily, enemy.sprite, {
      name: prettifyName(config.enemy_type),
      statusEffects: enemy.statusEffects,
      health: enemy.health,
    });

    const ai = new EnemyAI(enemy, getPlayer, blocker, { speed: SWARM_SPEED });

    const combat = new EnemyCombat(enemy, getPlayer, blocker, {
      onAttack: (attackId) => enemy.animationController.play("attack", { abilityId: attackId }),
    });

    spawned.push({ enemy, ai, combat, label });
  }

  return spawned;
};
