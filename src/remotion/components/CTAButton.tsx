import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface CTAButtonProps {
  text: string;
  subtext?: string;
  delay?: number;
  pulse?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  subtext,
  delay = 0,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 14, mass: 0.8 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);

  const pulseScale = pulse
    ? 1 + Math.sin(frame * 0.12) * 0.03
    : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        transform: `scale(${scale * pulseScale})`,
        opacity: progress,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
          borderRadius: 60,
          padding: "24px 64px",
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 800,
          color: C.white,
          boxShadow: `0 15px 40px rgba(34,197,94,0.4)`,
          letterSpacing: -0.5,
        }}
      >
        {text}
      </div>
      {subtext && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: 18,
            color: C.muted,
            fontWeight: 500,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};
