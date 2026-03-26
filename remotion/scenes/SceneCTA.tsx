import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { ConvergingParticles } from "../components/Particles";

const { fontFamily } = loadFont();

const C = {
  bg: "#050509",
  violet: "#5B5BD6",
  green: "#00A878",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 223;

function DevizlyLogoWatermark() {
  return (
    <svg width={60} height={60} viewBox="0 0 48 48" fill="none" opacity={0.15}>
      <rect width="48" height="48" rx="12" fill={C.violet} />
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="white"
        opacity="0.9"
      />
      <path d="M25 18L20 26H24L22 34L29 24H25L27 18Z" fill={C.violet} />
    </svg>
  );
}

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // URL entrance
  const urlProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, mass: 0.6 },
  });
  const urlScale = interpolate(urlProgress, [0, 1], [0.6, 1]);

  // Glow pulse
  const glowIntensity = Math.sin(frame * 0.1) * 0.3 + 0.7;

  // Subtitle
  const subProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  // Logo watermark
  const logoProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 25, mass: 1 },
  });

  // Final fade out (soft)
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 40, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Converging particles: green */}
      <ConvergingParticles
        targetX={960}
        targetY={400}
        color={`${C.green}60`}
        count={30}
        seed={111}
        startFrame={20}
      />
      {/* Converging particles: violet */}
      <ConvergingParticles
        targetX={960}
        targetY={400}
        color={`${C.violet}60`}
        count={30}
        seed={222}
        startFrame={25}
      />

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
          gap: 24,
          opacity: fadeOut,
        }}
      >
        {/* Glow behind URL */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.violet}25 0%, transparent 70%)`,
            opacity: glowIntensity,
            filter: "blur(30px)",
          }}
        />

        {/* URL */}
        <div
          style={{
            opacity: urlProgress,
            transform: `scale(${urlScale})`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: C.white,
              fontFamily,
              letterSpacing: -3,
              textShadow: `0 0 40px ${C.violet}50, 0 0 80px ${C.violet}20`,
            }}
          >
            devizly.fr
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: C.muted,
              fontFamily,
            }}
          >
            Essai gratuit {"\u00B7"} Sans carte bancaire
          </span>
        </div>

        {/* Watermark logo */}
        <div
          style={{
            marginTop: 50,
            opacity: logoProgress * 0.5,
          }}
        >
          <DevizlyLogoWatermark />
        </div>
      </div>
    </AbsoluteFill>
  );
};
