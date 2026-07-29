import type Phaser from "phaser";
import StatusEffectController from "../combat/StatusEffectController";
import { Weapon } from "../combat/Weapon";
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

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);
    this.health.update(deltaMs);

    const body = this.body;
    body.setVelocity(0);

    const speed = PLAYER_SPEED * this.statusEffects.getMagnitude("speed", 1) * this.statusEffects.getMagnitude("slow", 1);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) body.setVelocityX(speed);

    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    else if (this.cursors.down.isDown) body.setVelocityY(speed);

    body.velocity.normalize().scale(speed);

    const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
    const movingLeft = body.velocity.x < 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, movingLeft);
  }

  stop() {
    this.body.setVelocity(0);
  }
}
