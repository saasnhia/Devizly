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
  redMuted: "#DC2626",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 365;

const PROBLEMS = [
  { text: "Devis trop longs...", delay: 10, icon: "\u23F1" },
  { text: "Zero conversion...", delay: 80, icon: "\uD83D\uDCC9" },
  { text: "Pas de relance...", delay: 150, icon: "\uD83D\uDE36" },
];

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animation: "30 min perdues" with counting up
  const counterStart = 220;
  const counterProgress = spring({
    frame: frame - counterStart,
    fps,
    config: { damping: 20, mass: 0.7 },
  });
  const counterValue = Math.min(
    30,
    Math.floor(interpolate(frame - counterStart, [0, 60], [0, 30], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  // Fade out
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 25, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Subtle red vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${C.red}08 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          opacity: fadeOut,
        }}
      >
        {PROBLEMS.map(({ text, delay, icon }) => {
          const p = spring({
            frame: frame - delay,
            fps,
            config: { damping: 18, mass: 0.8 },
          });
          const x = interpolate(p, [0, 1], [-80, 0]);
          const opacity = interpolate(p, [0, 1], [0, 1]);

          // Shake effect after appearing
          const shake =
            frame > delay + 15 && frame < delay + 30
              ? Math.sin((frame - delay) * 2) * 3
              : 0;

          return (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                transform: `translateX(${x + shake}px)`,
                opacity,
              }}
            >
              <span style={{ fontSize: 44 }}>{icon}</span>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: C.redMuted,
                  fontFamily,
                  letterSpacing: -1,
                }}
              >
                {text}
              </span>
            </div>
          );
        })}

        {/* Counter */}
        <div
          style={{
            marginTop: 50,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: counterProgress,
            transform: `scale(${interpolate(counterProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <span style={{ fontSize: 56 }}>{"\u23F1"}</span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: C.red,
              fontFamily,
              letterSpacing: -2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {counterValue} min perdues
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
