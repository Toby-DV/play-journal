# Play-Journal
[Demo Video](https://youtu.be/T8fDD7PzMU0)

> **Why just read your journal entries when you can play them?**

Play-Journal is an interactive diary app that turns your daily entries into custom, 2D games, tailored to your mood and the contents of your entry.
---

## Key Features

- **Interactive Chronicle:** Turn your daily text journal logs into playable, 2D fantasy dungeon crawling experiences in real time.
- **Dynamic Mood Visualization:** Experientially feel your diary entry with custom tints, visual vignette effects, and background rain matching your mood.
- **Themed Fantasy Book Interface:** A gorgeous, medieval book-themed diary UI complete with leather overlays, realistic page layouts, and animated brand graphics.
- **Custom Character Sprite Crawl:** Play with dynamically generated weapons and combat entities.
- **Local-First:** Everything - your identity, your entries, your generated games - stays on your device in localStorage. No account, no server.

---

## Gallery

<div align="center">
  <img src="frontend/public/image_1.png" alt="Book Cover and Interface" width="800" style="margin-bottom: 20px;" />
  <img src="frontend/public/image_2.png" alt="Dynamic Journal Entry Input" width="800" style="margin-bottom: 20px;" />
  <img src="frontend/public/image_3.png" alt="Playable Dungeon Gameplay Screen" width="800" />
</div>

---

## Technical Implementation Details

- **Local Journal-to-Game Pipeline:** A small client-side function maps journal text to a `GameConfig` (mood, dungeon length, theme, boss/weapon flavor) via keyword heuristics - no network call, no AI.
- **Phaser 3 Engine:** Procedurally generated dungeons rendered with `Phaser.GameObjects.Sprite` classes and a modular, data-driven combat system (weapons/abilities/status effects defined as plain data under `src/game/combat/`).
- **Next.js Frontend:** Built with Next.js App Router and Tailwind CSS, leveraging custom CSS animations (`::before` slides) for micro-interactions.
- **Local Storage Only:** Display name, journal entries, and generated game configs are all persisted in the browser via `localStorage`/`sessionStorage` - see `src/lib/auth.ts`, `src/lib/journal.ts`, and `src/lib/gameSession.ts`.

---

## Tech Stack

### Frontend
- **Framework:** Next.js (App Router, Tailwind CSS, TypeScript)
- **Game Engine:** Phaser 3 (HTML5 Canvas/WebGL game framework)

---

## Repository Structure

```
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages (journal at "/", play, account)
│   │   ├── components/    # UI elements (Tome pages, navigation bar)
│   │   ├── game/          # Phaser configurations, entities (Player, Enemy), and scenes
│   │   ├── lib/           # Local storage helpers, formatting, and journal-to-game generation
│   │   └── types/         # TypeScript interface definitions (GameConfig)
```

---

## Setting Up

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.
