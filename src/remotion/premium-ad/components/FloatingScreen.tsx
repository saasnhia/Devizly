import React from "react";
import { Img, staticFile, interpolate, spring } from "remotion";

interface FloatingScreenProps {
  src: string;
  frame: number;
  fps: number;
  entryDelay?: number;
  mirrorTilt?: boolean;
  opacity?: number;
  screenWidth?: string;
  violetFrame?: boolean;
  style?: React.CSSProperties;
}

export const FloatingScreen: React.FC<FloatingScreenProps> = ({
  src,
  frame,
  fps,
  entryDelay = 0,
  mirrorTilt = false,
  opacity = 1,
  screenWidth = "88%",
  violetFrame = false,
  style,
}) => {
  const entryProgress = spring({
    frame: frame - entryDelay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const entryY = interpolate(entryProgress, [0, 1], [120, 0]);
  const entryOpacity = interpolate(entryProgress, [0, 1], [0, 1]);

  const tiltX = interpolate(frame, [0, 90], [8, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tiltYBase = interpolate(frame, [0, 90], [-12, -4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tiltY = mirrorTilt ? -tiltYBase : tiltYBase;
  const floatY = Math.sin(frame / 40) * 8;

  return (
    <div
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 40%",
        display: "flex",
        justifyContent: "center",
        opacity: entryOpacity * opacity,
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${entryY + floatY}px)`,
          transformStyle: "preserve-3d",
          borderRadius: 12,
          border: violetFrame
            ? "3px solid rgba(124,58,237,0.8)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: violetFrame
            ? [
                "0 0 0 1px rgba(124,58,237,0.6)",
                "0 0 60px rgba(124,58,237,0.4)",
                "0 30px 80px rgba(0,0,0,0.8)",
              ].join(", ")
            : [
                "0 0 80px rgba(124,58,237,0.35)",
                "0 40px 120px rgba(0,0,0,0.8)",
                "inset 0 1px 0 rgba(255,255,255,0.1)",
              ].join(", "),
          overflow: violetFrame ? "hidden" : undefined,
          width: screenWidth,
          maxWidth: 900,
        }}
      />
    </div>
  );
};
