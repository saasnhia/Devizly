import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../constants";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  animation?: "spring" | "typewriter" | "fade" | "slideUp";
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = C.white,
  fontWeight = 700,
  lineHeight = 1.3,
  textAlign = "center",
  animation = "spring",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  if (animation === "typewriter") {
    const charsPerFrame = 0.8;
    const chars = Math.floor(Math.max(0, f) * charsPerFrame);
    const displayed = text.slice(0, chars);
    const showCursor = f >= 0 && f % 16 < 10;

    return (
      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight,
          color,
          lineHeight,
          textAlign,
          ...style,
        }}
      >
        {displayed}
        {showCursor && (
          <span style={{ color: C.green, opacity: 0.8 }}>|</span>
        )}
      </div>
    );
  }

  if (animation === "slideUp") {
    const progress = spring({ frame: f, fps, config: { damping: 20, mass: 0.8 } });
    const y = interpolate(progress, [0, 1], [60, 0]);
    return (
      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight,
          color,
          lineHeight,
          textAlign,
          transform: `translateY(${y}px)`,
          opacity: progress,
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  if (animation === "fade") {
    const opacity = interpolate(
      f,
      [0, 10],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return (
      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight,
          color,
          lineHeight,
          textAlign,
          opacity,
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  // spring (default)
  const progress = spring({ frame: f, fps, config: { damping: 18, mass: 0.8 } });
  const scale = interpolate(progress, [0, 1], [0.7, 1]);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize,
        fontWeight,
        color,
        lineHeight,
        textAlign,
        transform: `scale(${scale})`,
        opacity: progress,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
