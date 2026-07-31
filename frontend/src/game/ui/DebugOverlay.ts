import type Phaser from "phaser";
import type Player from "../entities/Player";
import PlayerCombat from "../combat/PlayerCombat";

const DEPTH = 2000;
const MARGIN_X = 10;
const MARGIN_TOP = 60;

// Minecraft-style debug panel: hidden by default, F3 toggles it. Weapon name is the first line -
// add more as more debug info is needed.
export default class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private f3Key: Phaser.Input.Keyboard.Key;
  private wasF3Down = false;
  private visible = true;

  constructor(scene: Phaser.Scene, private player: Player, private playerCombat: PlayerCombat) {
    this.text = scene.add
      .text(MARGIN_X, MARGIN_TOP, this.render(), {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#e2e8f0",
        backgroundColor: "#0f172acc",
        padding: { x: 6, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setVisible(true);

    this.f3Key = scene.input.keyboard!.addKey("F3");
  }

  update(): void {
    const isDown = this.f3Key.isDown;
    const justPressed = isDown && !this.wasF3Down;
    this.wasF3Down = isDown;
    if (justPressed) {
      this.visible = !this.visible;
      this.text.setVisible(this.visible);
    }

    if (this.visible) this.text.setText(this.render());
  }

  private render(): string {
    const cooldownStr = Array.from(this.playerCombat.cooldownTracker.cooldowns, ([key, value]) => `${key}:${Math.ceil((value/1000)).toFixed(0)}`).join("\n")
    return (`
Weapon: ${this.player.weapon.id}
Health: ${this.player.health.getHp.toFixed(2)}

Cooldowns:
${cooldownStr}
`);
  }
}
