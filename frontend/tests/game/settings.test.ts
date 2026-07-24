import { describe, it, expect } from "vitest";
import { sanitizeSettings, DEFAULT_SETTINGS } from "@/game/settings";

describe("sanitizeSettings", () => {
  it("returns defaults for missing or malformed input", () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings("junk")).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid values", () => {
    expect(sanitizeSettings({ showPlayerName: false })).toEqual({
      showPlayerName: false,
    });
  });

  it("replaces wrong-typed fields with defaults", () => {
    expect(sanitizeSettings({ showPlayerName: "yes" })).toEqual(DEFAULT_SETTINGS);
  });
});
