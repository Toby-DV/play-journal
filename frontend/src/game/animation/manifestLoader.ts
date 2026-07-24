import type Phaser from "phaser";
import { GameConfig } from "@/types/game";
import { ClipDef, SpriteManifest } from "./SpriteManifest";
import { SpriteProvider, LocalSpriteProvider, SLICED_KNIGHT_MANIFEST, GENERIC_ENEMY_MANIFEST, BOSS_SPRITE_ID } from "./SpriteProvider";
import { pickManifest } from "./resolveAnimation";

const MANIFEST_FETCH_TIMEOUT_MS = 5000;

// Never lets a slow/hanging SpriteProvider block dungeon creation - a timed-out fetch is treated
// the same as "sprite id not found" (see pickManifest).
function fetchManifestWithTimeout(provider: SpriteProvider, spriteId: string): Promise<SpriteManifest | null> {
  return Promise.race([
    provider.getManifest(spriteId).catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), MANIFEST_FETCH_TIMEOUT_MS)),
  ]);
}

function queueManifestTextures(scene: Phaser.Scene, manifest: SpriteManifest, queued: Set<string>) {
  (Object.values(manifest.clips) as ClipDef[]).forEach((clip) => {
    if (queued.has(clip.textureKey) || scene.textures.exists(clip.textureKey)) return;
    queued.add(clip.textureKey);
    scene.load.spritesheet(clip.textureKey, clip.textureUrl, { frameWidth: clip.frameWidth, frameHeight: clip.frameHeight });
  });
}

function manifestHasFailedTexture(manifest: SpriteManifest, failedKeys: Set<string>): boolean {
  return (Object.values(manifest.clips) as ClipDef[]).some((clip) => failedKeys.has(clip.textureKey));
}

// Resolves the player/enemy sprite manifests (falling back to the sliced knight for the player
// and the generic manifest for the enemy on fetch failure, unknown id, or a texture actually
// failing to download) and loads every clip's texture before returning, so by the time this
// resolves everything needed to build Player/Enemy's AnimationControllers is already in the
// texture manager.
export async function loadEntityManifests(
  scene: Phaser.Scene,
  PhaserLib: typeof Phaser,
  config: GameConfig
): Promise<{ player: SpriteManifest; enemy: SpriteManifest; boss: SpriteManifest }> {
  const spriteProvider: SpriteProvider = new LocalSpriteProvider();

  const [playerFetched, enemyFetched, bossFetched] = await Promise.all([
    fetchManifestWithTimeout(spriteProvider, config.player_sprite),
    fetchManifestWithTimeout(spriteProvider, config.enemy_type),
    fetchManifestWithTimeout(spriteProvider, BOSS_SPRITE_ID),
  ]);

  let playerManifest = pickManifest("player", playerFetched);
  let enemyManifest = pickManifest("enemy", enemyFetched);
  // Boss falls back through the same generic enemy placeholder as regular enemies - there's
  // no dedicated "generic boss" art, and a distinct boss-typed asset (see SpriteProvider's
  // BOSS_SPRITE_ID handling) is preferred over it whenever one is available.
  let bossManifest = pickManifest("enemy", bossFetched);

  const failedKeys = new Set<string>();
  scene.load.on(PhaserLib.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => failedKeys.add(file.key));

  const queued = new Set<string>();
  // Always queue the fallback manifests too, so there's a guaranteed-loaded fallback even if
  // a fetched manifest's own texture URLs 404 after the fetch itself succeeded.
  queueManifestTextures(scene, SLICED_KNIGHT_MANIFEST, queued);
  queueManifestTextures(scene, GENERIC_ENEMY_MANIFEST, queued);
  queueManifestTextures(scene, playerManifest, queued);
  queueManifestTextures(scene, enemyManifest, queued);
  queueManifestTextures(scene, bossManifest, queued);

  await new Promise<void>((resolve) => {
    scene.load.once(PhaserLib.Loader.Events.COMPLETE, () => resolve());
    scene.load.start();
  });

  if (manifestHasFailedTexture(playerManifest, failedKeys)) playerManifest = SLICED_KNIGHT_MANIFEST;
  if (manifestHasFailedTexture(enemyManifest, failedKeys)) enemyManifest = GENERIC_ENEMY_MANIFEST;
  if (manifestHasFailedTexture(bossManifest, failedKeys)) bossManifest = GENERIC_ENEMY_MANIFEST;

  return { player: playerManifest, enemy: enemyManifest, boss: bossManifest };
}
