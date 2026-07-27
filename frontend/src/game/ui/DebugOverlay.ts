import type Phaser from "phaser";

const DEPTH = 2000;
const MARGIN_X = 10;
const MARGIN_TOP = 60;

// Minecraft-style debug panel: hidden by default, F3 toggles it. Weapon name is the first line -
// add more as more debug info is needed.
export default class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private f3Key: Phaser.Input.Keyboard.Key;
  private wasF3Down = false;
  private visible = false;

  constructor(scene: Phaser.Scene, private weaponName: string) {
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
      .setVisible(false);

    this.f3Key = scene.input.keyboard!.addKey("F3");
  }

  update(): void {
    const isDown = this.f3Key.isDown;
    const justPressed = isDown && !this.wasF3Down;
    this.wasF3Down = isDown;
    if (!justPressed) return;

    this.visible = !this.visible;
    this.text.setVisible(this.visible);
  }

  private render(): string {
    return `Weapon: ${this.weaponName}`;
  }
}
