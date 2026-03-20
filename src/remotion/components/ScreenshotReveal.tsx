import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C } from "../constants";

interface ScreenshotRevealProps {
  delay?: number;
  scale?: number;
  src?: string;
}

/**
 * Displays the real Devizly devis screenshot with a spring slide-up
 * and subtle 3D rotation animation.
 */
export const ScreenshotReveal: React.FC<ScreenshotRevealProps> = ({
  delay = 0,
  scale = 0.85,
  src = "marketing/devis ads.png",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const progress = spring({ frame: f, fps, config: { damping: 22, mass: 1.2 } });
  const y = interpolate(progress, [0, 1], [120, 0]);
  const rotateX = interpolate(progress, [0, 1], [5, 0]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translateY(${y}px) perspective(1200px) rotateX(${rotateX}deg) scale(${scale})`,
        opacity: progress,
      }}
    >
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px ${C.bgLight}`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: 900,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};
