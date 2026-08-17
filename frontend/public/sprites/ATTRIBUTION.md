# Sprite attribution

## skeleton/

"Pixel Skeleton" by **David Harrington** — <https://opengameart.org/content/pixel-skeleton>

Licensed **CC-BY 4.0** (<https://creativecommons.org/licenses/by/4.0/>).

The original single sheet is kept at `source-sheets/skeleton/skeleton-Sheet.png`. The per-state
strips in `skeleton/` are sliced from it: the sheet's purple backdrop is keyed to transparent, the
baked-in row labels are dropped, and every frame is lifted 2px so the skeleton shares a ground line
with the knight.

## bat/, crab/, rat/, slime/, pebble/, skull/, golem/

"Enemy Galore I" by **Admurin** — <https://admurin.itch.io/enemy-galore-1>

Admurin's own terms: free for personal and commercial projects, modification allowed, credit not
required but appreciated. **The assets may not be resold or redistributed as game assets** — they
have to ship as part of a project.

Source frames are 64x64 in 4-wide row-major grids, with the art occupying a ~32px region. Each
enemy is cropped to a single 32x32 window (shared across all its states so the origin stays put),
anchored so grounded enemies' feet land on y=29 — the knight's ground line. Trailing blank frames
are dropped.

State mapping, where the pack's naming differs from ours:

| id       | walk           | attack               | death                |
| -------- | -------------- | -------------------- | -------------------- |
| `bat`    | `Bat_Fly`      | `Bat_Attack`         | `Bat_Death`          |
| `crab`   | `Crab_Run`     | `Crab_AttackA`       | `Crab_Death`         |
| `rat`    | `Rat_Run`      | `Rat_Attack`         | `Rat_Death`          |
| `slime`  | `Run`          | `Jump`               | `Death`              |
| `pebble` | `Pebble_Run`   | — (none in the pack) | `Pebble_Death`       |
| `skull`  | `Fly`          | — (none in the pack) | `Death`              |
| `golem`  | `Golem_Run`    | `Golem_AttackB`      | `Golem_DeathB`       |

Notes on the picks:

- The golem uses `AttackB`; `AttackA` raises an arm 2px above the 32px window.
- `skull/death.png` is the pack's falling death, so the skull leaves the window and the clip ends
  on empty air. Frames past that point are dropped.
- The pack's **armored golem** is deliberately not shipped: its only death-shaped clip is
  `ArmorBreak`, which sheds the armor and leaves the golem standing, and a manifest with no real
  `death` falls back to `walk` (see `resolveAnimation.ts`), so a corpse would keep walking.
