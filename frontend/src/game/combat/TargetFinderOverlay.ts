import type Phaser from "phaser";
import { TargetFinder } from "./TargetFinders";
import { TILE_SIZE } from "../constants";

const FILL_COLOR = 0xff0000;
const FILL_ALPHA = 0.35;
// Above tile layers (depth 0) but below entity sprites (player sits at depth 1)
const DEPTH = 0.5;

export default class TargetFinderOverlay {
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.add.graphics().setDepth(DEPTH);
    }

    show(origin: { x: number; y: number }, targetFinder: TargetFinder): void {
        this.graphics.clear();
        if (targetFinder.kind !== "radius") return;

        this.graphics.fillStyle(FILL_COLOR, FILL_ALPHA);
        this.graphics.fillCircle(origin.x, origin.y, targetFinder.rangeTiles * TILE_SIZE);
    }

    hide(): void {
        this.graphics.clear();
    }
}