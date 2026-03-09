import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Essaie gratuitement" — slide up spring at frame 5
  const titleProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // "devizly.fr" — frame 20
  const urlProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const urlY = interpolate(urlProgress, [0, 1], [40, 0]);
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  // Underline extends — frames 25-35
  const lineScaleX = interpolate(frame, [25, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge — frame 35
  const badgeProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const badgeY = interpolate(badgeProgress, [0, 1], [30, 0]);
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);

  // Gradient sweep from top
  const sweepY = interpolate(frame, [0, 15], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Gradient sweep background */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #7c3aed 0%, #1a0a2e 100%)",
          transform: `translateY(${sweepY}%)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.04em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Essaie gratuitement
        </div>

        <div
          style={{
            position: "relative",
            opacity: urlOpacity,
            transform: `translateY(${urlY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            devizly.fr
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "#ffffff",
              transform: `scaleX(${lineScaleX})`,
              transformOrigin: "left",
            }}
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "10px 24px",
            fontSize: 22,
            color: "#ffffff",
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            marginTop: 20,
          }}
        >
          🇫🇷 IA française · RGPD · Sans CB · 3 devis gratuits
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
