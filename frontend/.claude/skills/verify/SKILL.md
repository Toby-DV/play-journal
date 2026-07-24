---
name: verify
description: Build, launch, and drive the Play-Journal frontend to verify UI/game changes end-to-end
---

# Verifying the Play-Journal frontend

## Launch

```bash
cd frontend
npm run dev -- --port 3719   # run in background; ready when GET / returns 200
```

## Drive (Playwright)

`playwright` is already in frontend dependencies and Chromium is typically
installed at `%LOCALAPPDATA%\ms-playwright`. Run scripts with cwd =
`frontend/` and require playwright via
`require(path.join(process.cwd(), "node_modules", "playwright"))` if the
script lives outside the repo.

Everything is local-only (no backend) - set a display name up front with an
init script so the journal page skips the name-prompt overlay:

```js
await page.addInitScript(() => {
  localStorage.setItem("play_journal_display_name", "Toby");
});
```

## Flows worth driving

- `/` — the journal book; "Practice run (mock data)" starts a game from
  `mockGameConfig`, "Relive this day" runs the local `generateGameConfig()`
  heuristic on whatever's in the textarea. Both are instant, no network.
- `/play` — Phaser dungeon; wait for `canvas` plus ~1.5s for the scene to
  render before screenshotting. Player is the yellow dot.

## Gotchas

- `.tome-scene` is `position: fixed` → it's a stacking context; overlays
  meant to cover the NavBar (z-50) must be rendered outside it.
