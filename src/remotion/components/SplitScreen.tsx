import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface SplitScreenProps {
  delay?: number;
  leftLabel?: string;
  rightLabel?: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  delay = 0,
  leftLabel = "AVANT",
  rightLabel = "APRÈS",
  leftContent,
  rightContent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const dividerProgress = spring({ frame: f, fps, config: { damping: 18, mass: 1 } });
  const leftX = interpolate(dividerProgress, [0, 1], [-540, 0]);
  const rightX = interpolate(dividerProgress, [0, 1], [540, 0]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Left (Before) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "50%",
          height: "100%",
          background: "#1C1C1C",
          transform: `translateX(${leftX}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 800,
            color: C.red,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
          }}
        >
          {leftLabel}
        </div>
        {leftContent}
      </div>

      {/* Right (After) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "50%",
          height: "100%",
          background: C.bg,
          transform: `translateX(${rightX}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 800,
            color: C.green,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
          }}
        >
          {rightLabel}
        </div>
        {rightContent}
      </div>

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 4,
          height: "100%",
          background: C.violet,
          transform: "translateX(-50%)",
          opacity: dividerProgress,
          boxShadow: `0 0 20px ${C.violet}`,
        }}
      />
    </div>
  );
};
