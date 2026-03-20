import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface PriceTagProps {
  price: string;
  label: string;
  period?: string;
  delay?: number;
  highlight?: boolean;
  strikethrough?: boolean;
  color?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  label,
  period = "/mois",
  delay = 0,
  highlight = false,
  strikethrough = false,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 16, mass: 0.8 } });
  const scale = interpolate(progress, [0, 1], [0.6, 1]);

  const bgColor = highlight
    ? `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`
    : `linear-gradient(135deg, ${C.bgLight}, ${C.bgCard})`;

  const textColor = color ?? (highlight ? C.white : C.muted);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "28px 40px",
        borderRadius: 20,
        background: bgColor,
        border: highlight ? "2px solid rgba(255,255,255,0.2)" : `1px solid ${C.bgLight}`,
        transform: `scale(${scale})`,
        opacity: progress,
        boxShadow: highlight ? "0 20px 50px rgba(99,102,241,0.3)" : "none",
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 600,
          color: highlight ? "rgba(255,255,255,0.8)" : C.mutedDark,
          textTransform: "uppercase" as const,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 44,
          fontWeight: 900,
          color: textColor,
          textDecoration: strikethrough ? "line-through" : "none",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {price}
        <span style={{ fontSize: 18, fontWeight: 500, opacity: 0.7 }}>
          {period}
        </span>
      </div>
    </div>
  );
};
