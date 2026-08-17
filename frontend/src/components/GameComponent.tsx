"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { GameConfig } from "@/types/game";
import { createDungeonScene } from "@/game/scenes/DungeonScene";
import { getMoodBackground } from "@/lib/moodTint";
import { silkscreen } from "@/lib/fonts";

interface GameComponentProps {
  config: GameConfig;
  onLevelComplete: () => void;
  onPlayerDeath: () => void;
}

// https://github.com/mikewesthad/phaser-3-tilemap-blog-posts.
export default function GameComponent({ config, onLevelComplete, onPlayerDeath }: GameComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onPlayerDeathRef = useRef(onPlayerDeath);
  onLevelCompleteRef.current = onLevelComplete;

  useEffect(() => {
    if (!containerRef.current) return;

    let isDestroyed = false;
    let resizeObserver: ResizeObserver | null = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      const DungeonScene = createDungeonScene(Phaser, config, silkscreen.style.fontFamily, () => onLevelCompleteRef.current(), () => onPlayerDeathRef.current());

      const initialWidth = containerRef.current?.clientWidth || 800;
      const initialHeight = containerRef.current?.clientHeight || 600;

      const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: initialWidth,
        height: initialHeight,
        parent: containerRef.current,
        backgroundColor: getMoodBackground(config.mood),
        pixelArt: true,
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: DungeonScene,
      };

      const game = new Phaser.Game(gameConfig);
      gameRef.current = game;

      resizeObserver = new ResizeObserver((entries) => {
        if (!game || isDestroyed) return;
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          game.scale.resize(width, height);
        }
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    });

    return () => {
      isDestroyed = true;
      resizeObserver?.disconnect();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [config]);

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden bg-slate-950">
      <div ref={containerRef} className="w-full h-full min-h-[400px] block" />
    </div>
  );
}
