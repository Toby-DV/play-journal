import { AnimationState, ClipDef, ManifestKey, SpriteManifest } from "./SpriteManifest";
import { GENERIC_ENEMY_MANIFEST, SLICED_KNIGHT_MANIFEST } from "./SpriteProvider";

export type SpriteKind = "player" | "enemy";

// A manifest is safe to resolve against only if it has an idle or walk state
function hasFallbackBase(manifest: SpriteManifest): boolean {
  return manifest.clips.idle !== undefined || manifest.clips.walk !== undefined;
}

// Player fallback is the sliced knight (real art) rather than the generic placeholder humanoid;
export function pickManifest(spriteKind: SpriteKind, fetched: SpriteManifest | null): SpriteManifest {
  const fallback = spriteKind === "player" ? SLICED_KNIGHT_MANIFEST : GENERIC_ENEMY_MANIFEST;
  if (fetched && hasFallbackBase(fetched)) return fetched;
  return fallback;
}

// Missing-state fallback chain
export function resolveClip(manifest: SpriteManifest, requested: ManifestKey): ClipDef {
  const exact = manifest.clips[requested];
  if (exact) return exact;

  if (requested.startsWith("attack:")) {
    const genericAttack = manifest.clips.attack;
    if (genericAttack) return genericAttack;
  }

  const walk = manifest.clips.walk;
  if (walk) return walk;

  const idle = manifest.clips.idle;
  if (idle) return idle;

  throw new Error(`Sprite "${manifest.spriteId}" has no idle or walk clip to fall back to`);
}

const STATE_PRIORITY: Record<AnimationState, number> = {
  idle: 0,
  walk: 0,
  dash: 0,
  hit: 1,
  attack: 2,
  death: 3,
};

export function shouldInterrupt(current: AnimationState, requested: AnimationState): boolean {
  if (current === "death") return false;
  if (requested === current) return false;
  return STATE_PRIORITY[requested] > STATE_PRIORITY[current] || STATE_PRIORITY[current] === 0;
}
