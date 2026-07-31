import type Phaser from "phaser";
import StatusEffectController from "../combat/StatusEffectController";
import Health from "../combat/Health";
import { AggressiveCombatEntity, HitInfo } from "../combat/AttackComponent";
import { SpriteManifest } from "../animation/SpriteManifest";
import { resolveClip } from "../animation/resolveAnimation";
import AnimationController from "../animation/AnimationController";

// Must stay well under the shortest weapon attackSpeedMs or hits blur into a constant pulse
const HIT_FLASH_MS = 100;
const HIT_FLASH_TINT = 0xffffff;
// Phaser.TintModes.FILL - inlined because Enemy only imports Phaser as a type, not at runtime
const TINT_MODE_FILL = 1;
// Comfortably above EnemyAI's DEFAULT_SPEED (170) so the push visibly overrides the chase
const KNOCKBACK_SPEED = 400;
const KNOCKBACK_MS = 150;
// Fraction of speed surviving one full second; applied as decay^(deltaMs/1000) to stay frame-rate independent
const KNOCKBACK_DECAY_PER_SECOND = 0.01;

export interface EnemyOptions {
  // Scales incoming knockback. 1 takes it in full, 0 makes the enemy immovable.
  knockbackScale?: number;
}

export default class Enemy implements AggressiveCombatEntity {
  public sprite: Phaser.GameObjects.Sprite;
  public statusEffects: StatusEffectController = new StatusEffectController();
  public health: Health;
  public aggressionLevel: number;
  public animationController: AnimationController;
  private hitFlashMs = 0;
  private knockbackMs = 0;
  private knockbackScale: number;

  get x(): number {
    return this.sprite.x;
  }
  get y(): number {
    return this.sprite.y;
  }

  get isKnockedBack(): boolean {
    return this.knockbackMs > 0;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    aggressionLevel: number,
    maxHp: number,
    manifest: SpriteManifest,
    options: EnemyOptions = {}
  ) {
    this.knockbackScale = options.knockbackScale ?? 1;
    const idleClip = resolveClip(manifest, "idle");
    this.sprite = scene.add.sprite(x, y, idleClip.textureKey, 0);
    this.aggressionLevel = aggressionLevel;
    this.health = new Health(maxHp);
    this.animationController = new AnimationController(scene, this.sprite, manifest);
    scene.physics.add.existing(this.sprite);
    this.body.setCollideWorldBounds(true);
  }

  private get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  // Swaps the world bounds this enemy collides against for a custom rect, so it can't be lured or
  // knocked out of it. Relies on the setCollideWorldBounds above.
  confineTo(bounds: Phaser.Geom.Rectangle): void {
    this.body.setBoundsRectangle(bounds);
  }

  // hit.dirX/dirY point from attacker to this enemy, already normalised by resolveAttackComponents
  onDamaged(hit: HitInfo) {
    this.hitFlashMs = HIT_FLASH_MS;
    this.sprite.setTint(HIT_FLASH_TINT).setTintMode(TINT_MODE_FILL);

    const speed = KNOCKBACK_SPEED * hit.knockback * this.knockbackScale;
    if (speed === 0) return; // a 0-knockback weapon or immovable enemy shouldn't suspend the AI for KNOCKBACK_MS
    this.knockbackMs = KNOCKBACK_MS;
    this.body.setVelocity(hit.dirX * speed, hit.dirY * speed);
  }

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);

    if (this.hitFlashMs > 0) {
      this.hitFlashMs -= deltaMs;
      if (this.hitFlashMs <= 0) this.sprite.clearTint(); // also restores the default MULTIPLY mode
    }

    // Runs after EnemyAI.update yields movement control
    if (this.knockbackMs > 0) {
      this.knockbackMs -= deltaMs;
      if (this.knockbackMs <= 0) this.body.setVelocity(0); // hand a clean slate back to the AI
      else this.body.velocity.scale(Math.pow(KNOCKBACK_DECAY_PER_SECOND, deltaMs / 1000));
    }

    if (this.health.isDead) this.body.setVelocity(0);

    const isMoving = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, this.body.velocity.x);
  }

  stop() {
    this.body.setVelocity(0);
  }
}
