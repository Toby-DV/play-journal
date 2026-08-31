import type Phaser from "phaser";

const GRADIENT_STOPS = 12;
const EASE_POWER = 3.5; // higher = darkening/brightening stays concentrated nearer the edge

export interface VignetteOptions {
  key: string;
  rgb: [number, number, number];
  maxAlpha: number;
  blendMode?: "NORMAL" | "ADD" | "MULTIPLY" | "SCREEN";
}
export function addVignette(scene: Phaser.Scene, width: number, height: number, options: VignetteOptions) {
  const { key, rgb, maxAlpha, blendMode = "NORMAL" } = options;
  const [r, g, b] = rgb;

  if (!scene.textures.exists(key)) {
    const canvasTexture = scene.textures.createCanvas(key, width, height)!;
    const ctx = canvasTexture.getContext();
    const cx = width / 2;
    const cy = height / 2;
    // Reach the corners regardless of aspect ratio, not just based on height
    const maxRadius = Math.hypot(cx, cy);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    for (let i = 0; i <= GRADIENT_STOPS; i++) {
      const t = i / GRADIENT_STOPS;
      const alpha = Math.pow(t, EASE_POWER) * maxAlpha; // ease-in so the center stays clean longer
      gradient.addColorStop(t, `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    canvasTexture.refresh();
  }

  return scene.add
    .image(0, 0, key)
    .setOrigin(0, 0)
    .setDisplaySize(width, height)
    .setScrollFactor(0)
    .setBlendMode(blendMode);
}
