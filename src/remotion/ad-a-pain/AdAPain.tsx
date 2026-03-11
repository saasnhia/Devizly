import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { CTAScene } from "../shared/CTAScene";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

/* ═══════════════════════════════════════════
   HOOK — Kinetic Typography (0–90)
   ═══════════════════════════════════════════ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Word 1: "Tu perds" — slide from left
  const w1 = spring({ frame, fps, config: { damping: 15, stiffness: 200 } });
  const w1x = interpolate(w1, [0, 1], [-300, 0]);
  const w1o = interpolate(w1, [0, 1], [0, 1]);

  // Word 2: "2 HEURES" — scale explosion
  const w2 = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const w2scale = interpolate(w2, [0, 1], [0, 1.3]);
  // Settle
  const w2settle = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const w2final = frame < 25 ? w2scale : interpolate(w2settle, [0, 1], [1.3, 1.0]);
  const w2o = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 200 } }),
    [0, 1],
    [0, 1]
  );

  // Word 3: "par devis." — fade in
  const w3o = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#ffffff",
          opacity: w1o,
          transform: `translateX(${w1x}px)`,
        }}
      >
        Vous perdez
      </div>
      <div
        style={{
          fontSize: 144,
          fontWeight: 900,
          color: "#ef4444",
          opacity: w2o,
          transform: `scale(${w2final})`,
          lineHeight: 1,
        }}
      >
        2 HEURES
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 400,
          color: "#9ca3af",
          opacity: w3o,
        }}
      >
        par devis.
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   PROBLEM — Typewriter + strikethrough (90–210)
   ═══════════════════════════════════════════ */

const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const text = "Excel. Relances. Factures à la main.";
  const charsPerFrame = 1 / 3; // 3 frames per character
  const charCount = Math.min(text.length, Math.floor(frame * charsPerFrame));
  const typed = text.slice(0, charCount);
  const typingDone = charCount >= text.length;

  // Cursor blink
  const cursorOpacity = interpolate(
    frame % 16,
    [0, 8, 16],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Strikethrough at frame 90 relative (= actual 180)
  const strikeProgress = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        padding: 60,
      }}
    >
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#ef4444",
            lineHeight: 1.5,
          }}
        >
          {typed}
          {!typingDone && (
            <span style={{ opacity: cursorOpacity }}>▌</span>
          )}
        </div>
        {/* Strikethrough line */}
        {typingDone && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 4,
              backgroundColor: "#ef4444",
              width: `${strikeProgress * 100}%`,
              transform: "translateY(-50%)",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   FLASH TRANSITION (205–215)
   ═══════════════════════════════════════════ */

const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, 10], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity }} />
  );
};

/* ═══════════════════════════════════════════
   SOLUTION — Logo + lines + counter (210–360)
   ═══════════════════════════════════════════ */

const solutionLines = [
  "IA génère votre devis",
  "Client signe en ligne",
  "Facture créée auto",
];

const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo drop from top
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const logoY = interpolate(logoProgress, [0, 1], [-200, 0]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Counter 0→30 (frames 70–150 relative = 280–360 actual)
  const counterValue = interpolate(frame, [70, 140], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterOpacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#7c3aed",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 30,
        padding: 60,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#ffffff",
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          marginBottom: 20,
        }}
      >
        Devizly
      </div>

      {/* Solution lines with check pulse */}
      {solutionLines.map((line, i) => {
        const delay = 15 + i * 25;
        const lineProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const lineOpacity = interpolate(lineProgress, [0, 1], [0, 1]);
        const lineX = interpolate(lineProgress, [0, 1], [50, 0]);

        // Check pulse
        const pulseFrame = frame - delay - 5;
        const checkScale =
          pulseFrame > 0 && pulseFrame < 15
            ? interpolate(pulseFrame, [0, 7, 15], [1, 1.3, 1])
            : 1;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: lineOpacity,
              transform: `translateX(${lineX}px)`,
            }}
          >
            <span
              style={{
                fontSize: 40,
                transform: `scale(${checkScale})`,
              }}
            >
              ✅
            </span>
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {line}
            </span>
          </div>
        );
      })}

      {/* Counter */}
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: "#22c55e",
          marginTop: 30,
          opacity: counterOpacity,
        }}
      >
        {Math.round(counterValue)}s
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════════ */

export const AdAPain: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Hook: kinetic typography (0–90) */}
      <Sequence from={0} durationInFrames={90} premountFor={10}>
        <HookScene />
      </Sequence>

      {/* Problem: typewriter + strike (90–210) */}
      <Sequence from={90} durationInFrames={120} premountFor={10}>
        <ProblemScene />
      </Sequence>

      {/* Flash transition (205–215) */}
      <Sequence from={205} durationInFrames={10} premountFor={5}>
        <FlashTransition />
      </Sequence>

      {/* Solution: logo + lines + counter (210–360) */}
      <Sequence from={210} durationInFrames={150} premountFor={10}>
        <SolutionScene />
      </Sequence>

      {/* CTA (360–450) */}
      <Sequence from={360} durationInFrames={90} premountFor={10}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
