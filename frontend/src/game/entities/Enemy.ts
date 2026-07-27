import type Phaser from "phaser";
import StatusEffectController from "../combat/StatusEffectController";
import Health from "../combat/Health";
import { AggressiveCombatEntity } from "../combat/AttackComponent";
import { hexToNumber } from "@/lib/format";
import { SpriteManifest } from "../animation/SpriteManifest";
import { resolveClip } from "../animation/resolveAnimation";
import AnimationController from "../animation/AnimationController";

export default class Enemy implements AggressiveCombatEntity {
  public sprite: Phaser.GameObjects.Sprite;
  public statusEffects: StatusEffectController = new StatusEffectController();
  public health: Health;
  public aggressionLevel: number;
  public animationController: AnimationController;

  get x(): number {
    return this.sprite.x;
  }
  get y(): number {
    return this.sprite.y;
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
    this.sprite.setTint(hexToNumber(color));
    this.aggressionLevel = aggressionLevel;
    this.health = new Health(maxHp);
    this.animationController = new AnimationController(scene, this.sprite, manifest);
    scene.physics.add.existing(this.sprite);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  update(deltaMs: number) {
    this.statusEffects.update(deltaMs);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (this.health.isDead) body.setVelocity(0);

    const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
    this.animationController.update(this.health.getRatio(), this.health.isDead, isMoving, body.velocity.x < 0);
  }

  stop() {
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0);
  }
}
