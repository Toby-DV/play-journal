import React from "react";
import { Spread } from "./Book";
import { PageNo } from "./chrome";
import { formatDate, prettifyName } from "@/lib/format";
import { WEAPONS } from "@/game/data/weapons";
import { WEAPON_ATTACKS } from "@/game/data/weaponAttacks";

const ICON_SIZE = 40;

interface TodaySpreadProps {
  spreadIndex: number;
  weaponNo: number;
  journalText: string;
  onJournalTextChange: (text: string) => void;
  onGenerate: () => void;
  onPreviewMock: () => void;
}

export default function todaySpread({
  spreadIndex,
  weaponNo,
  journalText,
  onJournalTextChange,
  onGenerate,
  onPreviewMock,
}: TodaySpreadProps): Spread {
  const weapon = WEAPONS[weaponNo];
  const abilities = (weapon?.attackIds ?? [])
    .map((id) => WEAPON_ATTACKS.find((a) => a.id === id))
    .filter((a) => a !== undefined);

  const left = (
    <div className="tome-page-inner">
      <span className="tome-eyebrow">Your weapon</span>
      <h2 className="tome-heading">{weapon ? prettifyName(weapon.id) : "None"}</h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "1.1rem 0 0",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        {abilities.map((ability) => (
          <li key={ability.id} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
            {ability.icon ? (
              // eslint-disable-next-line @next/next/no-img-element -- tiny pixel-art sprite, next/image adds nothing
              <img
                src={`/icons/${ability.icon}.png`}
                alt=""
                width={ICON_SIZE}
                height={ICON_SIZE}
                style={{ imageRendering: "pixelated", flexShrink: 0 }}
              />
            ) : (
              // Same footprint as an icon so descriptions stay aligned
              <span
                aria-hidden
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  flexShrink: 0,
                  boxShadow: "inset 0 0 0 2px var(--ink-faded)",
                  opacity: 0.5,
                }}
              />
            )}
            <div>
              <div className="tome-eyebrow" style={{ color: "var(--ink)" }}>{ability.name}</div>
              <div className="tome-hand">{ability.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const right = (
    <div className="tome-page-inner">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="tome-heading">Today&apos;s page</span>
        <span className="tome-eyebrow">{formatDate(new Date().toISOString())}</span>
      </div>

      <textarea
        className="tome-write"
        style={{ marginTop: "1.1rem" }}
        value={journalText}
        onChange={(e) => onJournalTextChange(e.target.value)}
        aria-label="Today's journal entry"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className="tome-btn tome-btn-slide"
          onClick={onGenerate}
          disabled={!journalText.trim()}
        >
          Relive this day
        </button>
        {/* <button
          className="tome-eyebrow"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
          onClick={onPreviewMock}
        >
          Practice run (mock data)
        </button> */}
      </div>

      <PageNo n={spreadIndex * 2 + 2} side="right" />
    </div>
  );

  return { left, right };
}
