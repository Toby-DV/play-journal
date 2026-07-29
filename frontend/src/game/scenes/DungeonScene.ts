import type Phaser from "phaser";
import Dungeon from "@mikewesthad/dungeon";
import { TILE_SIZE } from "../constants";
import Player from "../entities/Player";
import { WEAPONS } from "../combat/Weapon";
import TILE_MAPPING from "../tileMapping";
import { GameConfig } from "@/types/game";
import { getMoodTint } from "@/lib/moodTint";
import { addVignette } from "../effects/vignette";
import { addConfetti } from "../effects/confetti";
import { addRain, followCamera as rainFollowCamera } from "../effects/rain";
import EntityLabel from "../ui/EntityLabel";
import { loadSettings, subscribeSettings } from "../settings";
import { getDisplayName } from "@/lib/auth";
import PlayerCombat from "../combat/PlayerCombat";
import { PhaserAttackInput } from "../combat/PhaserAttackInput";
import { LineOfSightBlocker } from "../combat/lineOfSight";
import { loadEntityManifests } from "../animation/manifestLoader";
import { SpriteManifest } from "../animation/SpriteManifest";
import RoomEncounter from "../dungeon/RoomEncounter";
import EnemySpawner, { SpawnedEnemy } from "../dungeon/EnemySpawner";
import { spawnBossRoom, spawnSwarmRoom } from "../dungeon/roomSpawnStrategies";
import assignRoomKinds from "../dungeon/assignRoomKinds";
import buildRoomDoors from "../dungeon/buildRoomDoors";
import { paintRooms, placeStairs } from "../dungeon/paintRooms";
import placeRoomStructures from "../dungeon/placeRoomStructures";
import Door from "../dungeon/Door";
import { DungeonRoom, RoomKind } from "../dungeon/types";
import TutorialBanner from "../ui/TutorialBanner";
import DebugOverlay from "../ui/DebugOverlay";

// Room count scales with length_of_day (Min: 5, Max: 10)
function getRoomCount(lengthOfDay: number): number {
  if (!Number.isFinite(lengthOfDay)) return 5;
  return Math.round(Math.min(10, Math.max(5, lengthOfDay)));
}

// One boss room per every 5 generated rooms (minimum 1)
function getBossRoomCount(totalRooms: number): number {
  return Math.max(1, Math.floor(totalRooms / 5));
}

function getSwarmRoomCount(totalRooms: number): number {
  return Math.max(1, Math.floor(totalRooms / 4));
}

const LEVEL_COMPLETE_DELAY_MS = 1500;
const STAIRS_REACH_RADIUS = TILE_SIZE * 0.75;
// Freeze-on-impact duration, currently disabled; try 60, and past ~120ms it reads as a frame hitch.
const HITSTOP_MS = 0;

export function createDungeonScene(
  PhaserLib: typeof Phaser,
  config: GameConfig,
  fontFamily: string,
  onLevelComplete: () => void
) {
  return class DungeonScene extends PhaserLib.Scene {
    private player!: Player;
    private playerLabel!: EntityLabel;
    private enemyInstances: SpawnedEnemy[] = [];
    private playerCombat!: PlayerCombat;
    private hitstopMs = 0;
    private isPlayerDead = false;
    private isLevelComplete = false;
    private tutorialBanner?: TutorialBanner;
    private debugOverlay!: DebugOverlay;
    private stairsPosition!: { x: number; y: number };
    private map!: Phaser.Tilemaps.Tilemap;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private stuffLayer!: Phaser.Tilemaps.TilemapLayer;
    private roomEncounters: RoomEncounter[] = [];
    private finalRoomDoors: Door[] = [];
    private bossEncounters: RoomEncounter[] = [];
    private moodOverlay!: Phaser.GameObjects.Rectangle;
    private vignette?: Phaser.GameObjects.Image;
    private rainSpawnZone?: { x: number; y: number; width: number; height: number; getRandomPoint(p: { x: number; y: number }): void };

    constructor() {
      super("DungeonScene");
    }

    preload() {
      this.load.image("tiles", "/tilesets/buch-tileset-48px.png");
    }

    async create() {
      const dungeon = new Dungeon({
        width: 50,
        height: 50,
        doorPadding: 2,
        rooms: {
          width: { min: 7, max: 15, onlyOdd: true },
          height: { min: 7, max: 15, onlyOdd: true },
          maxRooms: getRoomCount(config.length_of_day),
        },
      });

      this.buildTilemap(dungeon);

      const startRoom = dungeon.rooms[0];
      const finalRoom = dungeon.rooms[dungeon.rooms.length - 1];
      this.stairsPosition = placeStairs(this.map, this.stuffLayer, finalRoom);

      placeRoomStructures(this.stuffLayer, dungeon.rooms.slice(1, -1));

      const roomKindAssignments = assignRoomKinds(dungeon.rooms, [
        { kind: "boss", count: getBossRoomCount(dungeon.rooms.length) },
        { kind: "swarm", count: getSwarmRoomCount(dungeon.rooms.length) },
      ]);

      this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

      const { player: playerManifest, enemy: enemyManifest, boss: bossManifest } = await loadEntityManifests(this, PhaserLib, config);

      this.createPlayer(startRoom, playerManifest);

      // Reuses the same .collides flag Phaser already computed for player-movement collision
      // (via setCollisionByExclusion in buildTilemap), so line-of-sight blocking always matches
      // what actually blocks movement.
      const blocker: LineOfSightBlocker = {
        isBlocked: (x, y) =>
          !!this.groundLayer.getTileAtWorldXY(x, y)?.collides || !!this.stuffLayer.getTileAtWorldXY(x, y)?.collides,
      };

      this.spawnEnemies(dungeon, roomKindAssignments, { enemyManifest, bossManifest, blocker });

      // The stairs room's own doors
      this.finalRoomDoors = buildRoomDoors(this.stuffLayer, finalRoom);
      if (this.bossEncounters.length > 0) {
        this.finalRoomDoors.forEach((door) => door.close());
      }

      this.playerCombat = new PlayerCombat(
        this.player.weapon,
        this.player,
        () => this.enemyInstances.map(({ enemy }) => enemy),
        blocker,
        new PhaserAttackInput(this),
        {
          onAttack: (attackId) => {
            this.player.animationController.play("attack", { abilityId: attackId });
            // TODO: trigger from Enemy.onDamaged instead, so self-targeted abilities don't freeze.
            this.freezeFor(HITSTOP_MS);
          },
        }
      );

      this.debugOverlay = new DebugOverlay(this, this.player, this.playerCombat);

      this.wireMoodEffects();

      this.createTutorial();
    }

    private buildTilemap(dungeon: Dungeon) {
      // Create a blank map matching the dungeon's dimensions
      this.map = this.make.tilemap({
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
        width: dungeon.width,
        height: dungeon.height,
      });

      const tileset = this.map.addTilesetImage("tiles", undefined, TILE_SIZE, TILE_SIZE, 0, 0)!;
      this.groundLayer = this.map.createBlankLayer("Ground", tileset)!;
      // Second layer for items/decorations
      this.stuffLayer = this.map.createBlankLayer("Stuff", tileset)!;

      paintRooms(this.groundLayer, dungeon);

      // Everything except empty tiles and floor variants should block movement
      // hard-coded and needs changing when more tilemaps are added
      this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
      this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
      // setCollisionByExclusion above only registers indexes already present in the (still blank)
      // stuffLayer, so the closed-door tiles - not placed until a Door actually closes - need to
      // be registered explicitly or they'd render but not collide.
      this.stuffLayer.setCollision(
        [TILE_MAPPING.DOOR.CLOSED.HORIZONTAL, TILE_MAPPING.DOOR.CLOSED.VERTICAL],
        true
      );
    }

    private createPlayer(startRoom: Dungeon["rooms"][number], playerManifest: SpriteManifest) {
      const playerX = this.map.tileToWorldX(startRoom.centerX)!;
      const playerY = this.map.tileToWorldY(startRoom.centerY)!;
      const weapon = WEAPONS[config.weapon_no];
      this.player = new Player(this, playerX, playerY, weapon, playerManifest);
      this.cameras.main.startFollow(this.player.sprite, true);

      this.physics.add.collider(this.player.sprite, this.groundLayer);
      this.physics.add.collider(this.player.sprite, this.stuffLayer);

      this.playerLabel = new EntityLabel(this, fontFamily, this.player.sprite, {
        name: getDisplayName() ?? "You",
        statusEffects: this.player.statusEffects,
        health: this.player.health,
      });
      this.playerLabel.setNameVisible(loadSettings().showPlayerName);
      const unsubscribeSettings = subscribeSettings((settings) => {
        this.playerLabel.setNameVisible(settings.showPlayerName);
      });
      this.events.once(PhaserLib.Scenes.Events.SHUTDOWN, unsubscribeSettings);
      this.events.once(PhaserLib.Scenes.Events.DESTROY, unsubscribeSettings);
    }

    private spawnEnemies(
      dungeon: Dungeon,
      roomKindAssignments: ReadonlyMap<DungeonRoom, RoomKind>,
      manifests: { enemyManifest: SpriteManifest; bossManifest: SpriteManifest; blocker: LineOfSightBlocker }
    ) {
      // Player and Enemy implement CombatEntity themselves (live x/y getters), so both combat
      // systems take the entities directly.
      const spawner = new EnemySpawner();
      spawner.register("boss", spawnBossRoom);
      spawner.register("swarm", spawnSwarmRoom);
      const spawnResults = spawner.spawnAll(dungeon.rooms, roomKindAssignments, this.stuffLayer, {
        scene: this,
        map: this.map,
        config,
        enemyManifest: manifests.enemyManifest,
        bossManifest: manifests.bossManifest,
        fontFamily,
        getPlayer: () => this.player,
        blocker: manifests.blocker,
      });
      this.enemyInstances = spawnResults.flatMap((result) => result.spawned);
      this.roomEncounters = spawnResults.map((result) => result.encounter);
      this.bossEncounters = spawnResults.filter((result) => result.kind === "boss").map((result) => result.encounter);

      // Enemies collide with the same layers as the player (walls, structures, closed doors) and
      // each other
      const enemySprites = this.enemyInstances.map(({ enemy }) => enemy.sprite);
      enemySprites.forEach((sprite) => {
        this.physics.add.collider(sprite, this.groundLayer);
        this.physics.add.collider(sprite, this.stuffLayer);
      });
      if (enemySprites.length > 0) {
        this.physics.add.collider(enemySprites, enemySprites);
      }
    }

    // Full-screen mood tint (plus optional vignette/confetti/rain) so the run feels different
    // depending on whether the journal entry read as a good day or a bad one (see src/lib/moodTint.ts).
    private wireMoodEffects() {
      const tint = getMoodTint(config.mood);
      this.moodOverlay = this.add
        .rectangle(0, 0, this.scale.width, this.scale.height, tint.color, tint.alpha)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setBlendMode(tint.blendMode);
      this.scale.on(PhaserLib.Scale.Events.RESIZE, (gameSize: { width: number; height: number }) => {
        this.moodOverlay.setSize(gameSize.width, gameSize.height);
        this.vignette?.setDisplaySize(gameSize.width, gameSize.height);
      });

      // Extra colored vignette for moods that call for one, layered above the mood tint
      if (tint.vignette) {
        this.vignette = addVignette(this, this.scale.width, this.scale.height, tint.vignette);
      }

      // Falling confetti for happy days, currently disabled.
      if (tint.confetti) {
        addConfetti(this, this.scale.width);
      }

      // Light rain for reflective days, world-space so it scrolls with the tiles (see rain.ts)
      if (tint.rain) {
        this.rainSpawnZone = addRain(this).spawnZone;
      }
    }

    // Level-start tutorial, sourced from the journal entry's own game_rules - freezes gameplay
    // (see the update() gate below) until the player has stepped through every line, so SPACE
    // advancing text can never also fire the player's SPACE-triggered basic attack.
    private createTutorial() {
      if (config.game_rules.length === 0) return;
      this.tutorialBanner = new TutorialBanner(this, fontFamily, config.game_rules, () => {
        this.tutorialBanner = undefined;
      });
    }

    update(_time: number, delta: number) {
      // create() resolves sprite manifests asynchronously; guard against Phaser calling update()
      // on an earlier frame before it has finished.
      if (!this.player) return;

      this.debugOverlay.update();

      if (this.tutorialBanner) {
        this.tutorialBanner.update();
        return;
      }

      if (this.hitstopMs > 0) {
        this.hitstopMs -= delta;
        if (this.hitstopMs > 0) return;
        this.physics.world.resume();
        this.anims.resumeAll();
      }

      if (this.isPlayerDead || this.isLevelComplete) return;

      this.player.update(delta);
      // AI first so each enemy's update() sees the velocity chosen this frame when deriving its
      // animation state.
      this.enemyInstances.forEach(({ ai }) => ai.update(delta));
      this.enemyInstances.forEach(({ enemy }) => enemy.update(delta));
      this.enemyInstances.forEach(({ combat }) => combat.update(delta));
      this.playerCombat.update(delta);

      this.removeDeadEnemies();

      this.playerLabel.update();
      this.enemyInstances.forEach(({ label }) => label.update());

      const playerTileX = this.map.worldToTileX(this.player.x)!;
      const playerTileY = this.map.worldToTileY(this.player.y)!;
      this.roomEncounters.forEach((encounter) => encounter.update(playerTileX, playerTileY));

      // door.open() no-ops once already open, so it's fine to keep checking every frame rather
      // than tracking a separate "already opened" flag.
      if (this.bossEncounters.every((encounter) => encounter.isCleared)) {
        this.finalRoomDoors.forEach((door) => door.open());
      }

      if (this.rainSpawnZone) {
        rainFollowCamera(this, this.rainSpawnZone);
      }

      if (this.player.health.isDead) {
        this.handlePlayerDeath();
        return;
      }

      if (this.roomEncounters.every((encounter) => encounter.isCleared) && this.hasReachedStairs()) {
        this.handleLevelComplete();
      }
    }

    private hasReachedStairs(): boolean {
      const dx = this.player.x - this.stairsPosition.x;
      const dy = this.player.y - this.stairsPosition.y;
      return dx * dx + dy * dy < STAIRS_REACH_RADIUS * STAIRS_REACH_RADIUS;
    }

    // Skipping the per-entity update() calls isn't enough on its own - Phaser steps the physics
    // world and the animation manager itself, so both have to be paused or frozen enemies keep
    // gliding and animating.
    private freezeFor(ms: number) {
      // Guard, not an optimisation: without it a 0 would pause both systems and then skip the
      // resume below (gated on hitstopMs > 0), leaving the game permanently frozen.
      if (ms <= 0) return;
      if (this.hitstopMs <= 0) {
        this.physics.world.pause();
        this.anims.pauseAll();
      }
      this.hitstopMs = Math.max(this.hitstopMs, ms); // longest wins; overlapping hits don't stack
    }

    private removeDeadEnemies() {
      const alive: SpawnedEnemy[] = [];
      for (const instance of this.enemyInstances) {
        if (instance.enemy.health.isDead) {
          instance.label.destroy();
          instance.enemy.sprite.destroy();
        } else {
          alive.push(instance);
        }
      }
      this.enemyInstances = alive;
    }

    private handlePlayerDeath() {
      this.isPlayerDead = true;
      this.player.stop();
      this.enemyInstances.forEach(({ enemy }) => enemy.stop());
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, "YOU DIED", {
          fontFamily,
          fontSize: "32px",
          color: "#ef4444",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
    }

    private handleLevelComplete() {
      this.isLevelComplete = true;
      this.player.stop();
      this.enemyInstances.forEach(({ enemy }) => enemy.stop());
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, "LEVEL COMPLETE", {
          fontFamily,
          fontSize: "32px",
          color: "#4ade80",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
      this.time.delayedCall(LEVEL_COMPLETE_DELAY_MS, () => onLevelComplete());
    }
  };
}
