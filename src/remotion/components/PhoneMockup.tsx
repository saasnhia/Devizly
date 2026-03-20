import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface PhoneMockupProps {
  delay?: number;
  children: React.ReactNode;
  scale?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  delay = 0,
  children,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 20, mass: 1 } });
  const y = interpolate(progress, [0, 1], [100, 0]);

  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        opacity: progress,
      }}
    >
      <div
        style={{
          width: 380,
          height: 780,
          background: "#1A1A1A",
          borderRadius: 50,
          padding: 12,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 30,
            background: "#1A1A1A",
            borderRadius: "0 0 20px 20px",
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: C.white,
            borderRadius: 40,
            overflow: "hidden",
            fontFamily: FONT,
          }}
        >
          {/* Status bar */}
          <div
            style={{
              height: 44,
              background: C.white,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
              fontSize: 12,
              fontWeight: 600,
              color: C.bg,
            }}
          >
            <span>9:41</span>
            <div style={{ display: "flex", gap: 4 }}>
              <span>●●●●</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Content area */}
          <div style={{ padding: "0 16px", height: "calc(100% - 44px)", overflow: "hidden" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
