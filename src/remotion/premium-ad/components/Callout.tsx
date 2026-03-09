import React from "react";
import { interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["500"],
  subsets: ["latin"],
});

interface CalloutProps {
  text: string;
  frame: number;
  fps: number;
  delay: number;
}

export const Callout: React.FC<CalloutProps> = ({
  text,
  frame,
  fps,
  delay,
}) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const translateX = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderLeft: "3px solid #7c3aed",
        borderRadius: 8,
        padding: "12px 16px",
        fontFamily,
        fontSize: 26,
        fontWeight: 500,
        color: "#ffffff",
        width: 340,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {text}
    </div>
  );
};
