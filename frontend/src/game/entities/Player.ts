import type Phaser from "phaser";
import StatusEffectController from "../combat/StatusEffectController";
import { Weapon } from "../data/weapons";
import Health from "../combat/Health";
import { CombatEntity } from "../combat/AttackComponent";
import { SpriteManifest } from "../animation/SpriteManifest";
import { resolveClip } from "../animation/resolveAnimation";
import AnimationController from "../animation/AnimationController";

// Modeled on: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts
const PLAYER_SPEED = 350;
const PLAYER_MAX_HP = 100;
const PLAYER_REGEN_DELAY_MS = 5000;
const PLAYER_REGEN_PER_SECOND = 5;

export default class Player implements CombatEntity {
  public sprite: Phaser.GameObjects.Sprite;
  public statusEffects: StatusEffectController = new StatusEffectController();
  public health: Health = new Health(PLAYER_MAX_HP, { delayMs: PLAYER_REGEN_DELAY_MS, perSecond: PLAYER_REGEN_PER_SECOND });
  public weapon: Weapon;
  public animationController: AnimationController;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementOverrideMs: number = 0;
  // Latched unit vector - single source of truth for the sprite flip
  public facingX = 1;
  public facingY = 0;

  get x(): number {
    return this.sprite.x;
  }
  get y(): number {
    return this.sprite.y;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, weapon: Weapon, manifest: SpriteManifest) {
    this.weapon = weapon;
    const idleClip = resolveClip(manifest, "idle");
    this.sprite = scene.add.sprite(x, y, idleClip.textureKey, 0);
    this.sprite.setScale(1.4);
    this.sprite.setDepth(1);
    scene.physics.add.existing(this.sprite);
    this.body.setCollideWorldBounds(true);
    this.animationController = new AnimationController(scene, this.sprite, manifest);

    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  private get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  dash(dirX: number, dirY: number, speed: number, durationMs: number) {
    this.movementOverrideMs = durationMs
    this.body.setVelocity(dirX*speed, dirY*speed);
  }

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);
    this.health.update(deltaMs);

    const body = this.body;

    
    if (this.statusEffects.has("rooted") 
      || this.statusEffects.has("channeling") 
      || this.statusEffects.has("stunned")) {
      body.setVelocity(0) 
    }

    else if (this.movementOverrideMs > 0) {
      this.movementOverrideMs -= deltaMs
      if (this.movementOverrideMs <= 0) body.setVelocity(0);
    }
    
    else {
    body.setVelocity(0);

    const speed = PLAYER_SPEED * this.statusEffects.getMagnitude("speed", 1) * this.statusEffects.getMagnitude("slow", 1);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    else if (this.cursors.down.isDown) body.setVelocityY(speed);

    body.velocity.normalize().scale(speed);

    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      this.facingX = body.velocity.x / speed;
      this.facingY = body.velocity.y / speed;
    }}

    const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, this.facingX);
  }

  stop() {
    this.body.setVelocity(0);
  }
}
