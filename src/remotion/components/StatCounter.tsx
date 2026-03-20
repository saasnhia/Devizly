import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
  color?: string;
  fontSize?: number;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = "",
  prefix = "",
  label,
  delay = 0,
  color = C.green,
  fontSize = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 25, mass: 1.5 } });
  const currentValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  const scale = interpolate(progress, [0, 1], [0.5, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: progress,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {prefix}
        {currentValue.toLocaleString("fr-FR")}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 500,
          color: C.muted,
          textAlign: "center",
          maxWidth: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
};
