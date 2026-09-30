import { MemoryEntry } from "@/lib/journal";
import { Spread } from "./Book";
import { PageNo } from "./chrome";
import { formatDate, prettifyName } from "@/lib/format";
  
function dungeonDepth(lengthOfDay: number): number {
  if (!Number.isFinite(lengthOfDay)) return 5;
  return Math.round(Math.min(10, Math.max(5, lengthOfDay)));
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="tome-stat-row">
      <span style={{ color: "var(--ink-faded)" }}>{label}</span>
      <span className="leader" />
      <span>{value}</span>
    </div>
  );
}

export default function memorySpread(
  entry: MemoryEntry,
  spreadIndex: number,
  onRelive: (entry: MemoryEntry) => void
): Spread {
  const { config } = entry;
  const boss = config.bosses?.[0];

  const left = (
    <div className="tome-page-inner">
      <h2
        className="tome-heading"
        style={{
          marginTop: "0.9rem",
        }}
      >
        Day of {formatDate(entry.date)}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          marginTop: "1.6rem",
        }}
      >
        <StatRow label="Mood" value={prettifyName(config.mood)} />
        <StatRow label="Depth" value={`${dungeonDepth(config.length_of_day)} rooms`} />
        <StatRow label="Foe" value={prettifyName(config.enemy_type)} />
        {boss && <StatRow label="Boss" value={prettifyName(boss)} />}
      </div>

      <button
        className="tome-btn tome-btn-slide"
        style={{ marginTop: "1.8rem", alignSelf: "flex-start" }}
        onClick={() => onRelive(entry)}
      >
        Relive this memory
      </button>

      <PageNo n={spreadIndex * 2 + 1} side="left" />
    </div>
  );

  const right = (
    <div className="tome-page-inner">
      <div className="tome-eyebrow" style={{ textAlign: "right" }}>
        The memory
      </div>
      <p
        className="tome-hand"
        style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}
      >
        {entry.text}
      </p>
      <PageNo n={spreadIndex * 2 + 2} side="right" />
    </div>
  );

  return { left, right };
}
