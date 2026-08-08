export type EffectTag = "cc" | "buff" | "debuff";

export interface StatusEffectDefinition {
  id: string;
  label: string;
  color: string;
  tags: EffectTag[];
  blocksTags?: EffectTag[];
  magnitude?: number;
}

export const STATUS_EFFECTS: Record<string, StatusEffectDefinition> = {
  // magnitude is a fallback value -> 0.2 will reduce an enemy to 20% speed. 
  slow: {
    id: "slow",
    label: "SLOW",
    color: "#38bdf8",
    tags: ["cc", "debuff"],
    magnitude: 0.5,
  },
  speed: {
    id: "speed",
    label: "SPEED",
    color: "#e96f2d",
    tags: ["buff"],
    magnitude: 1.3
  },
  unstoppable: {
    id: "unstoppable",
    label: "UNSTOPPABLE",
    color: "#faa215",
    tags: ["buff"],
    blocksTags: ["cc"],
  },
  bonus_damage: {
    id: "bonus_damage",
    label: "BONUS DMG",
    color: "#f87171",
    tags: ["buff"],
    magnitude: 10,
  },
};

// TODO: add channeling / suppressed effects
