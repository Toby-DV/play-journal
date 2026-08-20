import { AnimationState, ClipDef, SpriteManifest } from "./SpriteManifest";

export interface SpriteProvider {
  getManifest(spriteId: string): Promise<SpriteManifest | null>;
}

// Sentinel spriteId for boss lookups
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

// The generic manifests are required to have 6 animations
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

// CC-BY 4.0, David Harrington (see public/sprites/ATTRIBUTION.md)
export const SKELETON_MANIFEST: SpriteManifest = {
  spriteId: "skeleton",
  clips: {
    idle: clip("skeleton", "idle", { frameCount: 5, frameRate: 6, repeat: -1 }),
    walk: clip("skeleton", "walk", { frameCount: 5, frameRate: 10, repeat: -1 }),
    attack: clip("skeleton", "attack", { frameCount: 8, frameRate: 14, repeat: 0 }),
    death: clip("skeleton", "death", { frameCount: 8, frameRate: 10, repeat: 0 }),
  },
};

// Enemy Galore I (Admurin - see public/sprites/ATTRIBUTION.md)
export const BAT_MANIFEST: SpriteManifest = {
  spriteId: "bat",
  clips: {
    idle: clip("bat", "idle", { frameCount: 4, frameRate: 12, repeat: -1 }),
    walk: clip("bat", "walk", { frameCount: 4, frameRate: 12, repeat: -1 }),
    attack: clip("bat", "attack", { frameCount: 7, frameRate: 14, repeat: 0 }),
    hit: clip("bat", "hit", { frameCount: 5, frameRate: 14, repeat: 0 }),
    death: clip("bat", "death", { frameCount: 11, frameRate: 12, repeat: 0 }),
  },
};

export const CRAB_MANIFEST: SpriteManifest = {
  spriteId: "crab",
  clips: {
    idle: clip("crab", "idle", { frameCount: 4, frameRate: 6, repeat: -1 }),
    walk: clip("crab", "walk", { frameCount: 6, frameRate: 12, repeat: -1 }),
    attack: clip("crab", "attack", { frameCount: 10, frameRate: 14, repeat: 0 }),
    hit: clip("crab", "hit", { frameCount: 3, frameRate: 12, repeat: 0 }),
    death: clip("crab", "death", { frameCount: 5, frameRate: 10, repeat: 0 }),
  },
};

export const RAT_MANIFEST: SpriteManifest = {
  spriteId: "rat",
  clips: {
    idle: clip("rat", "idle", { frameCount: 4, frameRate: 6, repeat: -1 }),
    walk: clip("rat", "walk", { frameCount: 6, frameRate: 14, repeat: -1 }),
    attack: clip("rat", "attack", { frameCount: 8, frameRate: 14, repeat: 0 }),
    hit: clip("rat", "hit", { frameCount: 4, frameRate: 12, repeat: 0 }),
    death: clip("rat", "death", { frameCount: 5, frameRate: 10, repeat: 0 }),
  },
};

export const SLIME_MANIFEST: SpriteManifest = {
  spriteId: "slime",
  clips: {
    idle: clip("slime", "idle", { frameCount: 4, frameRate: 6, repeat: -1 }),
    walk: clip("slime", "walk", { frameCount: 4, frameRate: 10, repeat: -1 }),
    attack: clip("slime", "attack", { frameCount: 8, frameRate: 12, repeat: 0 }),
    hit: clip("slime", "hit", { frameCount: 4, frameRate: 12, repeat: 0 }),
    death: clip("slime", "death", { frameCount: 6, frameRate: 10, repeat: 0 }),
  },
};

export const PEBBLE_MANIFEST: SpriteManifest = {
  spriteId: "pebble",
  clips: {
    idle: clip("pebble", "idle", { frameCount: 4, frameRate: 6, repeat: -1 }),
    walk: clip("pebble", "walk", { frameCount: 5, frameRate: 12, repeat: -1 }),
    hit: clip("pebble", "hit", { frameCount: 5, frameRate: 12, repeat: 0 }),
    death: clip("pebble", "death", { frameCount: 7, frameRate: 10, repeat: 0 }),
  },
};

export const SKULL_MANIFEST: SpriteManifest = {
  spriteId: "skull",
  clips: {
    idle: clip("skull", "idle", { frameCount: 4, frameRate: 6, repeat: -1 }),
    walk: clip("skull", "walk", { frameCount: 8, frameRate: 12, repeat: -1 }),
    hit: clip("skull", "hit", { frameCount: 4, frameRate: 12, repeat: 0 }),
    // The skull falls out of frame as it dies, so the clip ends on empty air by design
    death: clip("skull", "death", { frameCount: 6, frameRate: 10, repeat: 0 }),
  },
};

// Bulkiest of the pack, so it backs BOSS_SPRITE_ID
export const GOLEM_MANIFEST: SpriteManifest = {
  spriteId: "golem",
  clips: {
    idle: clip("golem", "idle", { frameCount: 4, frameRate: 5, repeat: -1 }),
    walk: clip("golem", "walk", { frameCount: 4, frameRate: 8, repeat: -1 }),
    attack: clip("golem", "attack", { frameCount: 7, frameRate: 12, repeat: 0 }),
    hit: clip("golem", "hit", { frameCount: 5, frameRate: 12, repeat: 0 }),
    death: clip("golem", "death", { frameCount: 9, frameRate: 10, repeat: 0 }),
  },
};

export class LocalSpriteProvider implements SpriteProvider {
  private manifests: Record<string, SpriteManifest> = {
    sliced_knight: SLICED_KNIGHT_MANIFEST,
    skeleton: SKELETON_MANIFEST,
    bat: BAT_MANIFEST,
    crab: CRAB_MANIFEST,
    rat: RAT_MANIFEST,
    slime: SLIME_MANIFEST,
    pebble: PEBBLE_MANIFEST,
    skull: SKULL_MANIFEST,
    golem: GOLEM_MANIFEST,
    [BOSS_SPRITE_ID]: GOLEM_MANIFEST,
    bug: {
      spriteId: "bug",
      clips: {
        idle: GENERIC_ENEMY_MANIFEST.clips.idle!,
        walk: GENERIC_ENEMY_MANIFEST.clips.walk!,
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
