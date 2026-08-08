import { describe, it, expect } from "vitest";
import { WEAPONS } from "@/game/data/weapons";
import { WEAPON_ATTACKS } from "@/game/data/weaponAttacks";

describe("WEAPONS", () => {
  it("gives each weapon a unique id", () => {
    const ids = WEAPONS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("draws every attackId from WEAPON_ATTACKS, with no duplicates within a weapon", () => {
    const validIds = new Set(WEAPON_ATTACKS.map((a) => a.id));
    for (const weapon of WEAPONS) {
      expect(new Set(weapon.attackIds).size).toBe(weapon.attackIds.length);
      for (const id of weapon.attackIds) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });
});
