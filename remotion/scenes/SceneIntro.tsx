import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Particles } from "../components/Particles";

const { fontFamily } = loadFont();

const C = {
  bg: "#050509",
  violet: "#5B5BD6",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 259;

const LINES = [
  { text: "Auto-entrepreneur ?", delay: 10 },
  { text: "Micro-entreprise ?", delay: 35 },
  { text: "Societe ?", delay: 60 },
];

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const subtitleDelay = 90;
  const subtitleProgress = spring({
    frame: frame - subtitleDelay,
    fps,
    config: { damping: 18, mass: 0.8 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);

  // Fade out at end of scene
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 25, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Particles
        color={`${C.violet}80`}
        count={25}
        seed={42}
        fadeIn={15}
        fadeOut={25}
        totalFrames={TOTAL_FRAMES}
      />

      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: fadeOut,
        }}
      >
        {LINES.map(({ text, delay }) => {
          const p = spring({
            frame: frame - delay,
            fps,
            config: { damping: 20, mass: 0.8 },
          });
          const y = interpolate(p, [0, 1], [50, 0]);
          const opacity = interpolate(p, [0, 1], [0, 1]);

          return (
            <div
              key={text}
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: C.white,
                fontFamily,
                letterSpacing: -2,
                transform: `translateY(${y}px)`,
                opacity,
              }}
            >
              {text}
            </div>
          );
        })}

        {/* Subtitle */}
        <div
          style={{
            marginTop: 40,
            fontSize: 36,
            fontWeight: 500,
            color: C.violet,
            fontFamily,
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleProgress,
          }}
        >
          J&apos;ai un truc pour vous
        </div>
      </div>
    </AbsoluteFill>
  );
};
