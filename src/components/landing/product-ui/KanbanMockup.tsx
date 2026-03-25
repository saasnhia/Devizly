"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

interface KanbanCard {
  id: number;
  client: string;
  title: string;
  amount: string;
  hot?: boolean;
}

const INITIAL: Record<string, KanbanCard[]> = {
  prospects: [
    { id: 1, client: "Marie Petit", title: "Site vitrine restaurant", amount: "4 350 €", hot: true },
    { id: 2, client: "Lucas Martin", title: "Logo + charte graphique", amount: "1 800 €" },
  ],
  envoyes: [
    { id: 3, client: "Sophie Durand", title: "App mobile React Native", amount: "8 500 €", hot: true },
  ],
  signes: [
    { id: 4, client: "Thomas Bernard", title: "Audit SEO complet", amount: "2 200 €" },
  ],
  payes: [
    { id: 5, client: "Emma Leroy", title: "Identité visuelle", amount: "3 100 €" },
  ],
};

const COLUMNS = [
  { key: "prospects", label: "Prospects", color: "#8b8fa8" },
  { key: "envoyes", label: "Envoyés", color: "#5e6ad2" },
  { key: "signes", label: "Signés", color: "#e8b44a" },
  { key: "payes", label: "Payés", color: "#3dd68c" },
];

/* Sequence of moves: [cardId, fromCol, toCol] */
const MOVES: [number, string, string][] = [
  [1, "prospects", "envoyes"],
  [3, "envoyes", "signes"],
  [4, "signes", "payes"],
];

function deepCopy(data: Record<string, KanbanCard[]>): Record<string, KanbanCard[]> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v.map((c) => ({ ...c }))])
  );
}

export function KanbanMockup() {
  const [board, setBoard] = useState(() => deepCopy(INITIAL));
  const [moveIdx, setMoveIdx] = useState(-1);
  const [movingId, setMovingId] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setBoard(deepCopy(INITIAL));
    setMoveIdx(-1);
    setMovingId(null);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (moveIdx === -1) {
      // Start first move after delay
      timer.current = setTimeout(() => setMoveIdx(0), 2000);
    } else if (moveIdx < MOVES.length) {
      const [cardId, from, to] = MOVES[moveIdx];
      // Highlight card
      setMovingId(cardId);
      timer.current = setTimeout(() => {
        // Move card
        setBoard((prev) => {
          const next = deepCopy(prev);
          const idx = next[from].findIndex((c) => c.id === cardId);
          if (idx >= 0) {
            const [card] = next[from].splice(idx, 1);
            next[to].unshift(card);
          }
          return next;
        });
        setMovingId(null);
        timer.current = setTimeout(() => setMoveIdx((i) => i + 1), 1500);
      }, 800);
    } else {
      // All moves done, pause then reset
      timer.current = setTimeout(reset, 3000);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [moveIdx, reset]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8b8fa8]">
        Pipeline
      </div>
      <div className="grid grid-cols-4 gap-2">
        {COLUMNS.map((col) => (
          <div key={col.key} className="min-h-[180px]">
            {/* Column header */}
            <div className="mb-2 flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <span className="text-[11px] font-semibold text-[#e8e9f0]">
                {col.label}
              </span>
              <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[#8b8fa8]">
                {board[col.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-1.5">
              {board[col.key].map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-white/[0.06] bg-[#08090a] p-2 transition-all duration-300"
                  style={{
                    boxShadow:
                      movingId === card.id
                        ? "0 0 0 1px #5e6ad2, 0 4px 12px rgba(94,106,210,0.2)"
                        : "none",
                    transform: movingId === card.id ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-[#e8e9f0]">
                      {card.client}
                    </span>
                    {card.hot && (
                      <span className="rounded bg-red-500/15 px-1 text-[8px] text-red-400">
                        🔥
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[9px] text-[#8b8fa8]">{card.title}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#e8e9f0]">
                    {card.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
