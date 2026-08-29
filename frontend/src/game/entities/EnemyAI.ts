import type Phaser from "phaser";
import Enemy from "./Enemy";
import { CombatEntity } from "../combat/AttackComponent";
import { LineOfSightBlocker, hasLineOfSight, isWithinRange } from "../combat/lineOfSight";
import { TILE_SIZE } from "../constants";

export interface EnemyAIOptions {
  speed?: number;
  aggroRangeTiles?: number;
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
  private lastSeen?: {x: number, y: number};

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

  shouldChase(targetX: number, targetY: number): boolean {
    const distance = Math.hypot(targetX - this.self.x, targetY - this.self.y)
    return distance > this.standoff &&
    (!this.aggroArea || this.aggroArea?.contains(targetX, targetY)) &&
    isWithinRange(this.self.x, this.self.y, targetX, targetY, this.aggroRange) &&
    hasLineOfSight(this.blocker, this.self.x, this.self.y, targetX, targetY);
  }

  moveTowards(body: Phaser.Physics.Arcade.Body, x: number, y: number, speed: number) {
    const dx = x - this.self.x;
    const dy = y - this.self.y;
    const distance = Math.hypot(dx, dy)
    body.setVelocity((dx / distance) * speed, (dy / distance) * speed);
  }

  update(_deltaMs: number): void {
    const body = this.self.sprite.body as Phaser.Physics.Arcade.Body;
    const speed = this.speed * this.self.statusEffects.getMagnitude("slow", 1)

    if (this.self.health.isDead) {
      body.setVelocity(0);
      return;
    }

    if (this.self.isKnockedBack || this.self.statusEffects.has("stunned")) return;
    if (this.self.isKnockedBack) return;

    const target = this.getTarget();

    if (this.shouldChase(target.x, target.y)) {
      this.moveTowards(body, target.x, target.y, speed);
      this.lastSeen = {x: target.x, y: target.y}
    } else if (this.lastSeen && this.shouldChase(this.lastSeen.x, this.lastSeen.y)) {
      this.moveTowards(body, this.lastSeen.x, this.lastSeen.y, speed)
    } else {
      // TODO: make enemies roam around their room
      body.setVelocity(0);
    }
  }
}
