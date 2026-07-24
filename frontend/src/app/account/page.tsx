"use client";

import React, { useEffect, useState } from "react";
import { getDisplayName, setDisplayName } from "@/lib/auth";
import { loadMemories } from "@/lib/journal";

export default function AccountPage() {
  const [name, setName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [stats, setStats] = useState({ totalJournals: 0 });

  useEffect(() => {
    const stored = getDisplayName() ?? "";
    setName(stored);
    setNameInput(stored);
    setStats({ totalJournals: loadMemories().length });
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setName(trimmed);
  };

  if (name === null) {
    return (
      <div className="tome-scene flex items-center justify-center min-h-screen">
        <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--torch)" }}>
          Consulting the archives...
        </span>
      </div>
    );
  }

  return (
    <div className="tome-scene flex flex-col items-center justify-start min-h-screen px-4 pt-28 pb-12 overflow-y-auto">
      <div
        className="w-full max-w-md p-8 border-2 rounded-lg shadow-2xl relative z-10 flex flex-col gap-6"
        style={{
          background: "linear-gradient(145deg, #1f120a 0%, #170d07 100%)",
          borderColor: "#4a3325",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)"
        }}
      >
        <div className="text-center border-b pb-4" style={{ borderColor: "#3e271a" }}>
          <h1
            className="text-3xl font-extrabold uppercase tracking-widest"
            style={{
              color: "var(--torch)",
              textShadow: "0 0 15px rgba(251, 191, 36, 0.3)"
            }}
          >
            Hero Profile
          </h1>
          <p className="text-xs mt-1" style={{ color: "#8a7550" }}>
            Adventurer credentials and key details
          </p>
        </div>

        <form onSubmit={handleSaveName} className="p-5 border rounded flex flex-col gap-3" style={{ background: "#120804", borderColor: "#3e271a" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8a7550" }}>
            Registered Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            style={{ background: "#1a0f08", borderColor: "#5c4033", color: "#d9c69e" }}
          />
          <button
            type="submit"
            disabled={!nameInput.trim() || nameInput.trim() === name}
            className="self-start px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer"
            style={{ background: "var(--torch)", color: "#1a1005" }}
          >
            Save
          </button>
        </form>

        {/* Journal Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 border rounded text-center flex flex-col gap-1"
            style={{
              background: "#120804",
              borderColor: "#3e271a",
            }}
          >
            <span className="text-2xl">📖</span>
            <span className="text-xl font-extrabold" style={{ color: "var(--torch)" }}>
              {stats.totalJournals}
            </span>
            <span className="text-[9px] uppercase font-bold" style={{ color: "#8a7550" }}>
              Spells Penned
            </span>
          </div>

          <div
            className="p-4 border rounded text-center flex flex-col gap-1"
            style={{
              background: "#120804",
              borderColor: "#3e271a",
            }}
          >
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-extrabold" style={{ color: "#a18262" }}>
              Active
            </span>
            <span className="text-[9px] uppercase font-bold" style={{ color: "#8a7550" }}>
              Quest Status
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
