import type Phaser from "phaser";
import { AttackInput } from "./PlayerCombat";

type AttackKeyName = "space" | "q" | "w" | "e";

export class PhaserAttackInput implements AttackInput {
  private keys: Record<AttackKeyName, Phaser.Input.Keyboard.Key>;
  private wasDown: Record<AttackKeyName, boolean> = { space: false, q: false, w: false, e: false };

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.keys = {
      space: keyboard.addKey("SPACE"),
      q: keyboard.addKey("Q"),
      w: keyboard.addKey("W"),
      e: keyboard.addKey("E"),
    };
  }

  isBasicAttackJustPressed(): boolean {
    return this.justPressed("space");
  }

  isAbilityJustPressed(slot: 0 | 1 | 2): boolean {
    const name: AttackKeyName = slot === 0 ? "q" : slot === 1 ? "w" : "e";
    return this.justPressed(name);
  }

  private justPressed(name: AttackKeyName): boolean {
    const isDown = this.keys[name].isDown;
    const justPressed = isDown && !this.wasDown[name];
    this.wasDown[name] = isDown;
    return justPressed;
  }
}
