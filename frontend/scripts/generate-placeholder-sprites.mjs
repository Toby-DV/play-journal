import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngjs from "pngjs";

const { PNG } = pngjs;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/sprites");

const FRAME_SIZE = 32;

// Must match the frameCount values in src/game/animation/SpriteProvider.ts's buildGenericManifest.
const STATES = [
  { name: "idle", frameCount: 2 },
  { name: "walk", frameCount: 4 },
  { name: "dash", frameCount: 3 },
  { name: "attack", frameCount: 3 },
  { name: "hit", frameCount: 2 },
  { name: "death", frameCount: 4 },
];

// [R, G, B] base color per sprite, so the two generic sprites are visually distinguishable.
const SPRITE_BASE_COLOR = {
  generic_humanoid: [56, 130, 246], // blue-ish
  generic_enemy: [220, 60, 60], // red-ish
};

function frameColor(base, frameIndex, frameCount) {
  const brightness = 0.55 + 0.45 * (frameCount === 1 ? 0 : frameIndex / (frameCount - 1));
  return base.map((channel) => Math.round(Math.min(255, channel * brightness)));
}

// Attack is the one state drawn as a shape rather than a full frame: enemies render with Phaser's
// FILL tint mode, which replaces every opaque pixel with one flat color, so the silhouette is the
// only thing that can carry the animation. Per-frame inset from each edge - the body squashes down
// and springs back out.
const ATTACK_FRAME_INSETS = [6, 10, 2];

// Out-of-frame reads as transparent, so the neighbour test below draws the frame edge as a border
// for the full-frame states exactly like the original x===0 || y===0 || ... check did.
function isOpaque(state, frameIndex, x, y) {
  if (x < 0 || y < 0 || x >= FRAME_SIZE || y >= FRAME_SIZE) return false;
  if (state !== "attack") return true;
  const inset = ATTACK_FRAME_INSETS[frameIndex];
  return x >= inset && y >= inset && x < FRAME_SIZE - inset && y < FRAME_SIZE - inset;
}

function writeSpritesheet(spriteId, state, frameCount) {
  const base = SPRITE_BASE_COLOR[spriteId];
  const width = FRAME_SIZE * frameCount;
  const png = new PNG({ width, height: FRAME_SIZE });

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const [r, g, b] = frameColor(base, frameIndex, frameCount);
    const opaque = (x, y) => isOpaque(state, frameIndex, x, y);
    for (let y = 0; y < FRAME_SIZE; y++) {
      for (let x = 0; x < FRAME_SIZE; x++) {
        const px = frameIndex * FRAME_SIZE + x;
        const idx = (width * y + px) << 2;
        if (!opaque(x, y)) {
          png.data[idx + 3] = 0;
          continue;
        }
        const isBorder = !opaque(x - 1, y) || !opaque(x + 1, y) || !opaque(x, y - 1) || !opaque(x, y + 1);
        if (isBorder) {
          png.data[idx] = Math.round(r * 0.5);
          png.data[idx + 1] = Math.round(g * 0.5);
          png.data[idx + 2] = Math.round(b * 0.5);
        } else {
          png.data[idx] = r;
          png.data[idx + 1] = g;
          png.data[idx + 2] = b;
        }
        png.data[idx + 3] = 255;
      }
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${spriteId}_${state}.png`);
  png.pack().pipe(fs.createWriteStream(outPath));
  console.log(`wrote ${outPath}`);
}

for (const spriteId of Object.keys(SPRITE_BASE_COLOR)) {
  for (const { name, frameCount } of STATES) {
    writeSpritesheet(spriteId, name, frameCount);
  }
}
