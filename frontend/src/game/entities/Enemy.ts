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
// Comfortably above EnemyAI's DEFAULT_SPEED (170) so the push visibly overrides the chase
const KNOCKBACK_SPEED = 400;
const KNOCKBACK_MS = 150;
// Fraction of speed surviving one full second; applied as decay^(deltaMs/1000) to stay frame-rate independent
const KNOCKBACK_DECAY_PER_SECOND = 0.01;

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

  get isKnockedBack(): boolean {
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

  // dirX/dirY point from attacker to this enemy, already normalised by resolveAttackComponents
  onDamaged(_amount: number, dirX: number, dirY: number) {
    this.hitFlashMs = HIT_FLASH_MS;
    this.sprite.setTint(HIT_FLASH_TINT);

    this.knockbackMs = KNOCKBACK_MS;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(dirX * KNOCKBACK_SPEED, dirY * KNOCKBACK_SPEED);
  }

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);

    if (this.hitFlashMs > 0) {
      this.hitFlashMs -= deltaMs;
      if (this.hitFlashMs <= 0) this.sprite.setTint(this.baseTint);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Runs after EnemyAI.update (see DungeonScene's update order), which yields entirely while
    // isKnockedBack, so nothing overwrites the impulse before it decays.
    if (this.knockbackMs > 0) {
      this.knockbackMs -= deltaMs;
      if (this.knockbackMs <= 0) body.setVelocity(0); // hand a clean slate back to the AI
      else body.velocity.scale(Math.pow(KNOCKBACK_DECAY_PER_SECOND, deltaMs / 1000));
    }

    if (this.health.isDead) body.setVelocity(0);

    const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, body.velocity.x < 0);
  }

  stop() {
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
  }
}
