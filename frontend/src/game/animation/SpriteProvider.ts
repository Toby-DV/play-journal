import { AnimationState, ClipDef, SpriteManifest } from "./SpriteManifest";

export interface SpriteProvider {
  getManifest(spriteId: string): Promise<SpriteManifest | null>;
}

// Sentinel spriteId for boss lookups - doesn't match any real player/enemy sprite id, so
// LocalSpriteProvider can tell "give me the boss-flavored pick" apart from the regular enemy
// lookup (which prefers type "enemy") without changing the SpriteProvider interface.
export const BOSS_SPRITE_ID = "__boss__";

function clip(spriteId: string, state: AnimationState, opts: { frameCount: number; frameRate: number; repeat: number }): ClipDef {
  return {
    textureKey: `${spriteId}_${state}`,
    textureUrl: `/sprites/${spriteId}/${state}.png`,
    frameWidth: 32,
    frameHeight: 32,
    frameCount: opts.frameCount,
    frameRate: opts.frameRate,
    repeat: opts.repeat,
  };
}

// Backs an "attack:<attackId>" clip key, which resolveClip prefers over the shared attack clip.
// Colons aren't filename-safe, so the art is named attack_<attackId>.png in the sprite's folder.
function attackVariantClip(spriteId: string, attackId: string, opts: { frameCount: number; frameRate: number }): ClipDef {
  return {
    textureKey: `${spriteId}_attack_${attackId}`,
    textureUrl: `/sprites/${spriteId}/attack_${attackId}.png`,
    frameWidth: 32,
    frameHeight: 32,
    frameCount: opts.frameCount,
    frameRate: opts.frameRate,
    repeat: 0, // one-shot, like every attack clip
  };
}

// Fully populated (all six AnimationStates) - the only manifests required to be complete.
// GENERIC_ENEMY_MANIFEST is the guaranteed-safe fallback for any enemy sprite id
// resolveAnimation.ts can't otherwise resolve; the player-side equivalent is
// SLICED_KNIGHT_MANIFEST below (real art beats a placeholder box). Frame counts here must match
// frontend/scripts/generate-placeholder-sprites.mjs.
function buildGenericManifest(spriteId: string): SpriteManifest {
  return {
    spriteId,
    clips: {
      idle: clip(spriteId, "idle", { frameCount: 2, frameRate: 4, repeat: -1 }),
      walk: clip(spriteId, "walk", { frameCount: 4, frameRate: 8, repeat: -1 }),
      dash: clip(spriteId, "dash", { frameCount: 3, frameRate: 12, repeat: -1 }),
      attack: clip(spriteId, "attack", { frameCount: 3, frameRate: 10, repeat: 0 }),
      "attack:slowing_attack": attackVariantClip(spriteId, "slowing_attack", { frameCount: 3, frameRate: 10 }),
      hit: clip(spriteId, "hit", { frameCount: 2, frameRate: 10, repeat: 0 }),
      death: clip(spriteId, "death", { frameCount: 4, frameRate: 6, repeat: 0 }),
    },
  };
}

export const GENERIC_ENEMY_MANIFEST: SpriteManifest = buildGenericManifest("generic_enemy");

// fallback player
export const SLICED_KNIGHT_MANIFEST: SpriteManifest = {
  spriteId: "sliced_knight",
  clips: {
    idle: clip("sliced_knight", "idle", { frameCount: 1, frameRate: 4, repeat: -1 }),
    walk: clip("sliced_knight", "walk", { frameCount: 4, frameRate: 8, repeat: -1 }),
    attack: clip("sliced_knight", "attack", { frameCount: 3, frameRate: 12, repeat: 0 }),
    death: clip("sliced_knight", "death", { frameCount: 4, frameRate: 6, repeat: 0 }),
  },
};

// Dev/test implementation - a couple of hardcoded, deliberately sparse manifests (matching
// mockGameConfig's player_sprite: "sliced_knight" and enemy_type: "bug"), reusing the generic
// manifests' clips/art so no extra placeholder assets are needed. Unknown ids resolve null so
// the fallback path is exercised (see resolveAnimation.ts's pickManifest).
export class LocalSpriteProvider implements SpriteProvider {
  private manifests: Record<string, SpriteManifest> = {
    sliced_knight: SLICED_KNIGHT_MANIFEST,
    bug: {
      spriteId: "bug",
      clips: {
        idle: GENERIC_ENEMY_MANIFEST.clips.idle!,
        walk: GENERIC_ENEMY_MANIFEST.clips.walk!,
        // Placeholder attack art, so enemy attacks are visible while testing; hit/dash stay absent
        // to keep resolveClip's fallback path exercised.
        attack: GENERIC_ENEMY_MANIFEST.clips.attack!,
        "attack:slowing_attack": GENERIC_ENEMY_MANIFEST.clips["attack:slowing_attack"]!,
        death: GENERIC_ENEMY_MANIFEST.clips.death!,
      },
    },
  };

  async getManifest(spriteId: string): Promise<SpriteManifest | null> {
    return this.manifests[spriteId] ?? null;
  }
}
