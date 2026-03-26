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
  violetGlow: "rgba(91,91,214,0.15)",
  green: "#00A878",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 411;

const METIERS = [
  { text: "Site e-commerce...", delay: 120 },
  { text: "Renovation facade...", delay: 155 },
  { text: "Cuisine...", delay: 190 },
  { text: "Peu importe \u2713", delay: 225 },
];

function DevizlyLogo({ size, progress }: { size: number; progress: number }) {
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  return (
    <div style={{ transform: `scale(${scale})`, opacity: progress }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill={C.violet} />
        <path
          d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
          fill="white"
          opacity="0.9"
        />
        <path d="M25 18L20 26H24L22 34L29 24H25L27 18Z" fill={C.violet} />
      </svg>
    </div>
  );
}

export const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.6 },
  });

  // Title
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  // Badge
  const badgeProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  // Glow pulse
  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  // Fade out
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 25, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Violet ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet}15 0%, transparent 70%)`,
          opacity: glowPulse,
        }}
      />

      <Particles
        color={`${C.violet}60`}
        count={20}
        seed={77}
        fadeIn={20}
        fadeOut={25}
        totalFrames={TOTAL_FRAMES}
      />

      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          opacity: fadeOut,
        }}
      >
        {/* Logo */}
        <DevizlyLogo size={100} progress={logoProgress} />

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: C.white,
            fontFamily,
            letterSpacing: -2,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          Devizly
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: C.muted,
            fontFamily,
            opacity: titleProgress,
          }}
        >
          Logiciel de devis IA
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: `${C.green}20`,
            border: `1px solid ${C.green}40`,
            borderRadius: 30,
            padding: "10px 28px",
            opacity: badgeProgress,
            transform: `scale(${interpolate(badgeProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <span style={{ fontSize: 20 }}>{"\u2728"}</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.green,
              fontFamily,
            }}
          >
            Genere automatiquement
          </span>
        </div>

        {/* Metiers stagger */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          {METIERS.map(({ text, delay }) => {
            const p = spring({
              frame: frame - delay,
              fps,
              config: { damping: 20, mass: 0.7 },
            });
            const isLast = text.includes("\u2713");

            return (
              <div
                key={text}
                style={{
                  fontSize: 32,
                  fontWeight: isLast ? 700 : 500,
                  color: isLast ? C.green : C.muted,
                  fontFamily,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`,
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
