import type Phaser from "phaser";
import StatusEffectController from "../combat/StatusEffectController";
import Health from "../combat/Health";
import { AggressiveCombatEntity } from "../combat/AttackComponent";
import { hexToNumber } from "@/lib/format";
import { SpriteManifest } from "../animation/SpriteManifest";
import { resolveClip } from "../animation/resolveAnimation";
import AnimationController from "../animation/AnimationController";

// Must stay well under the shortest weapon attackSpeedMs or hits blur into a constant pulse
const HIT_FLASH_MS = 100;
const HIT_FLASH_TINT = 0xffffff;
// Phaser.TintModes.FILL - inlined because Enemy only imports Phaser as a type, not at runtime
const TINT_MODE_FILL = 1;

export default class Enemy implements AggressiveCombatEntity {
  public sprite: Phaser.GameObjects.Sprite;
  public statusEffects: StatusEffectController = new StatusEffectController();
  public health: Health;
  public aggressionLevel: number;
  public animationController: AnimationController;
  private baseTint: number;
  private hitFlashMs = 0;
  private knockbackMs = 0;

  get x(): number {
    return this.sprite.x;
  }
  get y(): number {
    return this.sprite.y;
  }

  get isKnockedBack(): Boolean {
    return this.knockbackMs > 0;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: string,
    aggressionLevel: number,
    maxHp: number,
    manifest: SpriteManifest
  ) {
    const idleClip = resolveClip(manifest, "idle");
    this.sprite = scene.add.sprite(x, y, idleClip.textureKey, 0);
    this.baseTint = hexToNumber(color);
    // Fill (not multiply) so the walk cycle's own frame-to-frame shading can't show through.
    // Mode persists across later setTint calls, so it only needs setting once.
    this.sprite.setTint(this.baseTint).setTintMode(TINT_MODE_FILL);
    this.aggressionLevel = aggressionLevel;
    this.health = new Health(maxHp);
    this.animationController = new AnimationController(scene, this.sprite, manifest);
    scene.physics.add.existing(this.sprite);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  onDamaged() {
    this.hitFlashMs = HIT_FLASH_MS;
    this.sprite.setTint(HIT_FLASH_TINT);
  }

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);

    if (this.hitFlashMs > 0) {
      this.hitFlashMs -= deltaMs;
      if (this.hitFlashMs <= 0) this.sprite.setTint(this.baseTint);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (this.health.isDead) body.setVelocity(0);

    const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, body.velocity.x < 0);
  }

  stop() {
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
  }
}
