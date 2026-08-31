import { CombatEntity } from "../combat/AttackComponent"
import type Phaser from "phaser";
import { Weapon } from "../data/weapons";
import PlayerCombat from "../entities/PlayerCombat";
import CooldownTracker from "../combat/CooldownTracker";
import { WEAPON_ATTACKS, WeaponAttackDefinition } from "../data/weaponAttacks";

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
    private cooldownTracker!: CooldownTracker;
    private weapon!: Weapon;
    public abilMap = new Map<string, number>

    private abilBg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private abilSlots: Phaser.GameObjects.Rectangle[];
    private abilSlotNums: Phaser.GameObjects.Text[];
    private castingText: Phaser.GameObjects.Text;
    private castHideTimer?: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, player: CombatEntity, playerCombat: PlayerCombat, fontFamily: string) {
        this.scene = scene;
        this.player = player;
        this.playerCombat = playerCombat;
        this.cooldownTracker = playerCombat.cooldownTracker;
        
        const x = scene.scale.width - MARGIN;
        const y = scene.scale.height - MARGIN;

        scene.add
            .circle(x, y, RADIUS, CIRCLE_COLOR, CIRCLE_ALPHA)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH);

        this.label = scene.add
            .text((scene.scale.width), (scene.scale.height), "", {
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

        // Sits just above the top edge of the ability box
        this.castingText = scene.add
            .text(this.abilBg.x, this.abilBg.y - RECT_HEIGHT / 2 - 10, "", {
                fontFamily,
                fontSize: "14px",
                color: "#f8fafc",
                align: "center",
            })
            .setOrigin(0.5, 1)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1);

        const abil1 = scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3, this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        const abil2 = scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3 + ABIL_PADDING + ABIL_WIDTH, this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        const abil3 = scene.add
            .rectangle(this.abilBg.x - RECT_WIDTH/3+ 2*(ABIL_PADDING + ABIL_WIDTH), this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);
        
        const abilNum1 = scene.add
            .text(abil1.x, abil1.y, "", {
                fontFamily,
                fontSize: "11px",
                color: "#f8fafc",
                align: "center",
            })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1);

        const abilNum2 = scene.add
            .text(abil2.x, abil2.y, "", {
                fontFamily,
                fontSize: "11px",
                color: "#f8fafc",
                align: "center",
            })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1);

        const abilNum3 = scene.add
            .text(abil3.x, abil3.y, "", {
                fontFamily,
                fontSize: "11px",
                color: "#f8fafc",
                align: "center",
            })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1);

        this.updateWeapon();
        
        let i = 0
        for (const id of this.weapon.attackIds) {
            this.abilMap.set(id, i);
            i++;}

        this.abilSlots = [abil1, abil2, abil3]
        this.abilSlotNums = [abilNum1, abilNum2, abilNum3]
    }

    updateWeapon() {
        this.weapon = this.playerCombat.activeWeapon;
        this.label.setText(this.weapon.id);
    }

    onCast(abilityId: string) {
        this.castingText.setText(WEAPON_ATTACKS.find((a) => a.id === abilityId)?.name || "");
        this.castHideTimer?.remove();
        this.castHideTimer = this.scene.time.delayedCall(800, () => this.castingText.setText(""));
    }

    update() {
        const cooldowns = this.cooldownTracker.cooldowns

        for (const [id, i] of this.abilMap) {
            const cooldownMs = cooldowns.get(id);
            if (cooldownMs) {
                this.abilSlots[i].setAlpha(0.9);
                this.abilSlotNums[i].setText(`${Math.ceil(cooldownMs/1000)}`)
            }
            else {
                this.abilSlots[i].setAlpha(0.5);
                this.abilSlotNums[i].setText("")
            }
        }
    }



}