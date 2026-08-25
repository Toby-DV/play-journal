import { CombatEntity } from "../combat/AttackComponent"
import type Phaser from "phaser";
import { Weapon } from "../data/weapons";
import PlayerCombat from "../combat/PlayerCombat";

const DEPTH = 1000;
const MARGIN = 120;
const RADIUS = 60;
const CIRCLE_COLOR = 0x1e293b;
const CIRCLE_ALPHA = 0.85;
const BORDER_COLOR = 0xf8fafc;
const BORDER_WIDTH = 2;

const RECT_WIDTH = 650;
const RECT_HEIGHT = 130;
const RECT_COLOR = 0x1e293b;

const ABIL_WIDTH = 50
const ABIL_PADDING = 20

export default class AbilityOverlay {
    private scene: Phaser.Scene;
    private player: CombatEntity;
    private playerCombat: PlayerCombat;
    private weapon!: Weapon;

    private abilBg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, player: CombatEntity, playerCombat: PlayerCombat, fontFamily: string) {
        this.scene = scene;
        this.player = player;
        this.playerCombat = playerCombat;

        const x = scene.scale.width - MARGIN;
        const y = scene.scale.height - MARGIN;

        scene.add
            .circle(x, y, RADIUS, CIRCLE_COLOR, CIRCLE_ALPHA)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH);

        this.label = scene.add
            .text(x, y, "", {
                fontFamily,
                fontSize: "11px",
                color: "#f8fafc",
                align: "center",
            })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1);
        
        this.abilBg = scene.add
            .rectangle((scene.scale.width) / 2, (scene.scale.height - RECT_HEIGHT/2),
            RECT_WIDTH, RECT_HEIGHT, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH)
            .setAlpha(0.5);
        
        scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3, this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3 + ABIL_PADDING + ABIL_WIDTH, this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3+ 2*(ABIL_PADDING + ABIL_WIDTH), this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        this.updateWeapon();
    }

    updateWeapon() {
        this.weapon = this.playerCombat.activeWeapon;
        this.label.setText(this.weapon.id);
    }



}