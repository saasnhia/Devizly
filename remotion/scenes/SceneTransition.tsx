import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const C = {
  bg: "#050509",
  red: "#EF4444",
  green: "#00A878",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 129;

export const SceneTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text enter
  const textProgress = spring({
    frame,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  // Bar animation: starts red, morphs to green
  const barStart = 30;
  const barWidth = interpolate(frame, [barStart, barStart + 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barColorShift = interpolate(frame, [barStart + 40, barStart + 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barColor = barColorShift < 0.5 ? C.red : C.green;

  // Fade out
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 20, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          opacity: fadeOut,
        }}
      >
        {/* Text */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            color: C.muted,
            fontFamily,
            letterSpacing: -1,
            opacity: textProgress,
            transform: `translateY(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          Votre logiciel actuel...
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 600,
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              borderRadius: 4,
              background: barColor,
              transition: "background 0.3s",
              boxShadow: `0 0 20px ${barColor}60`,
            }}
          />
        </div>

        {/* Arrow hint */}
        {barColorShift > 0.5 && (
          <div
            style={{
              fontSize: 28,
              color: C.green,
              fontFamily,
              fontWeight: 600,
              opacity: interpolate(
                frame,
                [barStart + 70, barStart + 85],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            Il existe mieux {"\u2192"}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
