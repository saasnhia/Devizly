import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Essaie gratuitement" — spring entrance
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const titleScale = interpolate(titleProgress, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // "devizly.fr" — pulse loop (scale 1→1.04→1)
  const pulsePhase = Math.max(0, frame - 20);
  const pulseScale =
    frame >= 20 ? 1 + 0.04 * Math.sin((pulsePhase / 30) * Math.PI * 2) : 0;
  const urlOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Sans CB · 14 jours" — fadeIn delay 50 frames
  const subtextOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtextY = interpolate(frame, [50, 65], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Main CTA */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.2,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        Essayez
        <br />
        gratuitement
      </div>

      {/* URL pulsing */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#7c3aed",
          marginTop: 40,
          opacity: urlOpacity,
          transform: `scale(${pulseScale})`,
        }}
      >
        devizly.fr
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#6b7280",
          marginTop: 30,
          opacity: subtextOpacity,
          transform: `translateY(${subtextY}px)`,
        }}
      >
        Sans CB · 14 jours
      </div>
    </AbsoluteFill>
  );
};
