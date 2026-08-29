import type Phaser from "phaser";
import Enemy from "./Enemy";
import { CombatEntity } from "../combat/AttackComponent";
import { LineOfSightBlocker, hasLineOfSight, isWithinRange } from "../combat/lineOfSight";
import { TILE_SIZE } from "../constants";

export interface EnemyAIOptions {
  speed?: number;
  aggroRangeTiles?: number;
  // Chase stops once this close, so the enemy crowds the target without jittering on top of it.
  standoffTiles?: number;
}

const DEFAULT_SPEED = 170;
const DEFAULT_AGGRO_RANGE_TILES = 7;
const DEFAULT_STANDOFF_TILES = 1.25;

// Basic chase AI: move straight at the target whenever it's within aggro range AND visible
export default class EnemyAI {
  private speed: number;
  private aggroRange: number;
  private standoff: number;
  private aggroArea?: Phaser.Geom.Rectangle;

  constructor(
    private readonly self: Enemy,
    private getTarget: () => CombatEntity,
    private blocker: LineOfSightBlocker,
    options?: EnemyAIOptions
  ) {
    this.speed = options?.speed ?? DEFAULT_SPEED;
    this.aggroRange = (options?.aggroRangeTiles ?? DEFAULT_AGGRO_RANGE_TILES) * TILE_SIZE;
    this.standoff = (options?.standoffTiles ?? DEFAULT_STANDOFF_TILES) * TILE_SIZE;
  }
  
  restrictTo(area: Phaser.Geom.Rectangle): void {
    this.aggroArea = area;
  }

  update(_deltaMs: number): void {
    const body = this.self.sprite.body as Phaser.Physics.Arcade.Body;

    if (this.self.health.isDead) {
      body.setVelocity(0);
      return;
    }

    // Yields control of movement
    if (this.self.isKnockedBack || this.self.statusEffects.has("stunned")) return;

    const target = this.getTarget();
    const dx = target.x - this.self.x;
    const dy = target.y - this.self.y;
    const distance = Math.hypot(dx, dy);

    const shouldChase =
      distance > this.standoff &&
      (!this.aggroArea || this.aggroArea.contains(target.x, target.y)) &&
      isWithinRange(this.self.x, this.self.y, target.x, target.y, this.aggroRange) &&
      hasLineOfSight(this.blocker, this.self.x, this.self.y, target.x, target.y);

    if (!shouldChase) {
      body.setVelocity(0);
      return;
    }

    // Same slow-status scaling the player's movement uses (see Player.update).
    const speed = this.speed * this.self.statusEffects.getMagnitude("slow", 1);
    body.setVelocity((dx / distance) * speed, (dy / distance) * speed);
  }
}
