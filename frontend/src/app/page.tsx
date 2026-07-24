"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockGameConfig } from "@/lib/mockGameConfig";
import { generateGameConfig } from "@/lib/generateGameConfig";
import { saveGameConfig } from "@/lib/gameSession";
import { MemoryEntry, loadMemories, saveMemory } from "@/lib/journal";
import Book, { Spread } from "@/components/book/Book";
import memorySpread from "@/components/book/MemorySpread";
import todaySpread from "@/components/book/TodaySpread";
import { getDisplayName, setDisplayName } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  // The tome's filled pages; null until localStorage has been read (client only)
  const [memories, setMemories] = useState<MemoryEntry[] | null>(null);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // null until localStorage has been read; empty string once read but unset, which triggers the
  // one-time name prompt below.
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  const [journalText, setJournalText] = useState("");
  const [fallingAsleep, setFallingAsleep] = useState(false);

  // Fade the scene to black — drifting off to sleep — then wake up in the dungeon.
  // Duration matches the fall-asleep animation in globals.css plus a small hold.
  const SLEEP_FADE_MS = 2200;
  const fallAsleepThenPlay = () => {
    setFallingAsleep(true);
    window.setTimeout(() => router.push("/play"), SLEEP_FADE_MS);
  };

  // Open the book on today's blank page (the spread after the last memory)
  useEffect(() => {
    setDisplayNameState(getDisplayName() ?? "");
    const stored = loadMemories();
    setMemories(stored);
    setSpreadIndex(stored.length);
  }, []);

  useEffect(() => {
    const handleClose = () => {
      setIsOpen(false);
    };
    window.addEventListener("close-book", handleClose);
    return () => window.removeEventListener("close-book", handleClose);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setDisplayNameState(trimmed);
  };

  // Turn the entry into a config locally, ink the page into the tome, then play it.
  const handleGenerateGame = () => {
    const config = generateGameConfig(journalText);
    saveMemory(journalText, config);
    saveGameConfig(config);
    fallAsleepThenPlay();
  };

  // Loads a local fixture matching the current GameConfig schema. Doesn't ink a page - it's a
  // test rig, not a memory.
  const handlePreviewMock = () => {
    saveGameConfig(mockGameConfig);
    fallAsleepThenPlay();
  };

  const handleRelive = (entry: MemoryEntry) => {
    saveGameConfig(entry.config);
    router.push("/play");
  };

  const spreads: Spread[] = useMemo(() => {
    if (memories === null) return [];
    const filled = memories.map((entry, i) => memorySpread(entry, i, handleRelive));
    return [
      ...filled,
      todaySpread({
        spreadIndex: memories.length,
        journalText,
        onJournalTextChange: setJournalText,
        onGenerate: handleGenerateGame,
        onPreviewMock: handlePreviewMock,
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories, journalText]);

  return (
    <>

    <div className="tome-scene flex flex-col items-center justify-center px-3 pt-20">
      <div className="tome-embers" aria-hidden />

      {memories !== null && displayName && (
        <Book
          spreads={spreads}
          index={spreadIndex}
          onIndexChange={setSpreadIndex}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}

      {memories !== null && displayName === "" && (
        <form
          onSubmit={handleNameSubmit}
          className="w-full max-w-sm p-8 border-2 rounded-lg shadow-2xl relative z-10 flex flex-col gap-4"
          style={{
            background: "linear-gradient(145deg, #2a1b12 0%, #1f120a 100%)",
            borderColor: "#4a3325",
          }}
        >
          <h2
            className="text-xl font-extrabold uppercase tracking-tight text-center"
            style={{ color: "var(--torch)" }}
          >
            Name your chronicle
          </h2>
          <input
            type="text"
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border rounded focus:outline-none"
            style={{ background: "#120804", borderColor: "#5c4033", color: "#d9c69e" }}
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full py-2.5 rounded font-bold uppercase tracking-wider text-sm cursor-pointer"
            style={{ background: "var(--torch)", color: "#1a1005" }}
          >
            Begin
          </button>
        </form>
      )}
    </div>

    {/* Sibling of .tome-scene: the fixed scene creates its own stacking
        context, so the overlay must live outside it to cover the nav bar. */}
    {fallingAsleep && <div className="sleep-fade" aria-hidden />}
    </>
  );
}
