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

const ABIL_WIDTH = 50
const ABIL_PADDING = 20
const ABIL_COUNT = 3

const BOX_PADDING_X = 35;
const BOX_PADDING_Y = 20;
const ABIL_ROW_WIDTH = ABIL_COUNT * ABIL_WIDTH + (ABIL_COUNT - 1) * ABIL_PADDING;

const RECT_WIDTH = ABIL_ROW_WIDTH + BOX_PADDING_X * 2;
const RECT_HEIGHT = ABIL_WIDTH + BOX_PADDING_Y * 2;
const RECT_COLOR = 0x1e293b;

const ROOT_BAR_MAX_WIDTH = RECT_WIDTH;
const ROOT_BAR_HEIGHT = 6;
const ROOT_BAR_COLOR = 0xe1d56c;

export default class AbilityOverlay {
    private scene: Phaser.Scene;
    private player: CombatEntity;
    private playerCombat: PlayerCombat;
    private cooldownTracker!: CooldownTracker;
    private weapon!: Weapon;
    public abilMap = new Map<string, number>

    private abilBg: Phaser.GameObjects.Rectangle;
    // private label: Phaser.GameObjects.Text;
    private abilSlots: Phaser.GameObjects.Rectangle[];
    private abilSlotNums: Phaser.GameObjects.Text[];
    private castingText: Phaser.GameObjects.Text;
    private castHideTimer?: Phaser.Time.TimerEvent;
    private rootBar: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, player: CombatEntity, playerCombat: PlayerCombat, fontFamily: string) {
        this.scene = scene;
        this.player = player;
        this.playerCombat = playerCombat;
        this.cooldownTracker = playerCombat.cooldownTracker;
        
        // const x = scene.scale.width - MARGIN;
        // const y = scene.scale.height - MARGIN;

        // scene.add
        //     .circle(x, y, RADIUS, CIRCLE_COLOR, CIRCLE_ALPHA)
        //     .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
        //     .setScrollFactor(0)
        //     .setDepth(DEPTH);

        // this.label = scene.add
        //     .text((scene.scale.width), (scene.scale.height), "", {
        //         fontFamily,
        //         fontSize: "11px",
        //         color: "#f8fafc",
        //         align: "center",
        //     })
        //     .setOrigin(0.5, 0.5)
        //     .setScrollFactor(0)
        //     .setDepth(DEPTH + 1);
        
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

        // Centered root-timer bar, just above the top edge of the ability box
        this.rootBar = scene.add
            .rectangle(this.abilBg.x, this.abilBg.y - RECT_HEIGHT / 2 - 4, ROOT_BAR_MAX_WIDTH, ROOT_BAR_HEIGHT, ROOT_BAR_COLOR)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setVisible(false);

        const abilRowStart = this.abilBg.x - ABIL_ROW_WIDTH / 2 + ABIL_WIDTH / 2;

        const abil1 = scene.add
            .rectangle(abilRowStart, this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        const abil2 = scene.add
            .rectangle(abilRowStart + (ABIL_PADDING + ABIL_WIDTH), this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
            .setStrokeStyle(BORDER_WIDTH, BORDER_COLOR)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setAlpha(0.5);

        const abil3 = scene.add
            .rectangle(abilRowStart + 2 * (ABIL_PADDING + ABIL_WIDTH), this.abilBg.y, ABIL_WIDTH, ABIL_WIDTH, RECT_COLOR)
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
        // this.label.setText(this.weapon.id);
    }

    onCast(abilityId: string) {
        this.castingText.setText(WEAPON_ATTACKS.find((a) => a.id === abilityId)?.name || "");
        this.castHideTimer?.remove();
        this.castHideTimer = this.scene.time.delayedCall(800, () => this.castingText.setText(""));
    }

    update() {
        const cooldowns = this.cooldownTracker.cooldowns
        const effects = this.player.statusEffects

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

        if (effects.has(["casting_rooted"])) {
            const ratio = effects.getRemainingRatio("casting_rooted");
            this.rootBar.setVisible(true);
            this.rootBar.scaleX = ratio;
        } else { this.rootBar.setVisible(false) };
    }



}