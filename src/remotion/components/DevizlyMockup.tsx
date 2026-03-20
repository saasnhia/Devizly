import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface QuoteItem {
  description: string;
  qty: number;
  price: number;
}

interface DevizlyMockupProps {
  delay?: number;
  items?: QuoteItem[];
  title?: string;
  clientName?: string;
  totalTTC?: number;
  showSignature?: boolean;
  scale?: number;
}

const defaultItems: QuoteItem[] = [
  { description: "Création site vitrine", qty: 1, price: 2500 },
  { description: "Design responsive", qty: 1, price: 800 },
  { description: "Intégration SEO", qty: 1, price: 400 },
  { description: "Formation client", qty: 2, price: 150 },
];

export const DevizlyMockup: React.FC<DevizlyMockupProps> = ({
  delay = 0,
  items = defaultItems,
  title = "Création site web - Boulangerie Martin",
  clientName = "Marie Martin",
  totalTTC,
  showSignature = false,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 22, mass: 1.2 } });
  const y = interpolate(progress, [0, 1], [80, 0]);

  const total = totalTTC ?? items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        opacity: progress,
        width: 900,
        background: C.white,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        fontFamily: FONT,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`,
          padding: "18px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: C.white,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <span style={{ color: C.white, fontSize: 18, fontWeight: 700 }}>
            Devizly
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            color: C.white,
            fontWeight: 600,
          }}
        >
          DEV-0042
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px" }}>
        {/* Title */}
        <div style={{ fontSize: 20, fontWeight: 700, color: C.bg, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: C.mutedDark, marginBottom: 20 }}>
          Client : {clientName}
        </div>

        {/* Items */}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              padding: "10px 16px",
              background: C.violet,
              fontSize: 11,
              fontWeight: 700,
              color: C.white,
              textTransform: "uppercase" as const,
              letterSpacing: 0.5,
            }}
          >
            <div style={{ flex: 5 }}>Description</div>
            <div style={{ flex: 1, textAlign: "right" as const }}>Qté</div>
            <div style={{ flex: 2, textAlign: "right" as const }}>Prix</div>
            <div style={{ flex: 2, textAlign: "right" as const }}>Total</div>
          </div>
          {/* Rows */}
          {items.map((item, i) => {
            const itemDelay = delay + 8 + i * 6;
            const itemProgress = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 20, mass: 0.6 },
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  fontSize: 13,
                  color: C.bg,
                  borderBottom: i < items.length - 1 ? "1px solid #E2E8F0" : "none",
                  background: i % 2 === 1 ? "#F1F5F9" : "transparent",
                  opacity: itemProgress,
                  transform: `translateX(${interpolate(itemProgress, [0, 1], [30, 0])}px)`,
                }}
              >
                <div style={{ flex: 5, fontWeight: 500 }}>{item.description}</div>
                <div style={{ flex: 1, textAlign: "right" as const }}>{item.qty}</div>
                <div style={{ flex: 2, textAlign: "right" as const }}>{item.price.toLocaleString("fr-FR")} €</div>
                <div style={{ flex: 2, textAlign: "right" as const, fontWeight: 700 }}>
                  {(item.qty * item.price).toLocaleString("fr-FR")} €
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 20,
            padding: "14px 0",
            borderTop: `2px solid ${C.bg}`,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: C.bg }}>
            Total TTC
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: C.violet,
            }}
          >
            {total.toLocaleString("fr-FR")} €
          </span>
        </div>

        {/* Signature */}
        {showSignature && (
          <div
            style={{
              marginTop: 12,
              padding: "14px 20px",
              background: "#F0FDF4",
              borderRadius: 12,
              border: "1px solid #BBF7D0",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 20 }}>✅</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.greenDark }}>
                Signé électroniquement
              </div>
              <div style={{ fontSize: 11, color: C.greenDark }}>
                par {clientName} — 17/03/2026
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
