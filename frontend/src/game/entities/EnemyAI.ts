import type Phaser from "phaser";
import Enemy from "./Enemy";
import { CombatEntity } from "../combat/AttackComponent";
import { LineOfSightBlocker, hasLineOfSight, isWithinRange, sweepUntilBlocked } from "../combat/lineOfSight";
import { TILE_SIZE } from "../constants";

export interface EnemyAIOptions {
  speed?: number;
  aggroRangeTiles?: number;
  standoffTiles?: number;
}

const DEFAULT_SPEED = 170;
const ROAMING_SPEED_FRAC = 0.4;
const DEFAULT_AGGRO_RANGE_TILES = 7;
const DEFAULT_STANDOFF_TILES = 1.25;

// Basic chase AI: move straight at the target whenever it's within aggro range AND visible
export default class EnemyAI {
  private speed: number;
  private aggroRange: number;
  private standoff: number;
  private aggroArea?: Phaser.Geom.Rectangle;
  private lastSeen?: {x: number, y: number};
  private wanderInfo?: {x: number, y: number, deadlineMs: number};

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

  private pickWanderLocation(): {x: number, y: number, deadlineMs: number} | undefined {
    const angle = Math.random() * Math.PI * 2;
    const dist = (Math.random() + 1) * 3 * TILE_SIZE;
    const toX = this.self.x + Math.cos(angle) * dist;
    const toY = this.self.y + Math.sin(angle) * dist;
    const clear = sweepUntilBlocked(this.blocker, this.self.x, this.self.y, toX, toY);
    const bounds = this.aggroArea;
    if (bounds && !bounds.contains(toX, toY)) { return undefined };
    if (Math.hypot(clear.x - this.self.x, clear.y - this.self.y) < TILE_SIZE / 2) { return undefined };
    return {...clear, deadlineMs: 4000};
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
    if (distance < 1) {body.setVelocity(0); return;}
    body.setVelocity((dx / distance) * speed, (dy / distance) * speed);
    if (body.blocked.left && dx < 0 || body.blocked.right && dx > 0) body.setVelocityX(0);
    if (body.blocked.up && dy < 0 || body.blocked.down && dy > 0) body.setVelocityY(0); 
  }

  update(deltaMs: number): void {
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
      this.lastSeen = {x: target.x, y: target.y};
      this.wanderInfo = undefined;
    } else if (this.lastSeen && this.shouldChase(this.lastSeen.x, this.lastSeen.y)) {
      this.moveTowards(body, this.lastSeen.x, this.lastSeen.y, speed)
      this.wanderInfo = undefined;
    } else if (this.wanderInfo && this.wanderInfo.deadlineMs > 0 && (Math.hypot(this.self.x - this.wanderInfo.x, this.self.y - this.wanderInfo.y)) > TILE_SIZE / 2) {
      this.moveTowards(body, this.wanderInfo.x, this.wanderInfo.y, speed/4);
      this.wanderInfo.deadlineMs -= deltaMs;
    } else {
      this.wanderInfo = this.pickWanderLocation();
    }
  }
}
