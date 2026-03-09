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
   HOOK — Result FIRST (0–90)
   ═══════════════════════════════════════════ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "💸 1 200 € encaissés." — scale explosion
  const mainScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.8 },
  });
  const scale1 = interpolate(mainScale, [0, 1], [0, 1.15]);
  const settle = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const finalScale = frame < 15 ? scale1 : interpolate(settle, [0, 1], [1.15, 1.0]);
  const mainOpacity = interpolate(mainScale, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "Ce matin." — delay
  const line2Opacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Pendant que tu dormais." — fade-in at frame 60
  const subOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [55, 70], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#16a34a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 10,
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.2,
          opacity: mainOpacity,
          transform: `scale(${finalScale})`,
        }}
      >
        💸 1 200 €
        <br />
        encaissés.
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "rgba(255,255,255,0.95)",
          opacity: line2Opacity,
          marginTop: 10,
        }}
      >
        Ce matin.
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 400,
          color: "rgba(255,255,255,0.8)",
          marginTop: 20,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        Pendant que tu dormais.
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   REWIND — Chronological reverse (90–240)
   ═══════════════════════════════════════════ */

const timelineSteps = [
  { time: "La veille à 18h", action: "→ Devis envoyé par IA en 30s" },
  { time: "Le client l'ouvre", action: "→ Signe depuis son téléphone" },
  { time: "Minuit", action: "→ Facture générée automatiquement" },
];

const RewindScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        fontFamily,
        padding: 60,
        flexDirection: "column",
        gap: 20,
      }}
    >
      {timelineSteps.map((step, i) => {
        const baseDelay = i * 40;

        // Time label — slide from right
        const timeProgress = spring({
          frame: frame - baseDelay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const timeX = interpolate(timeProgress, [0, 1], [200, 0]);
        const timeOpacity = interpolate(timeProgress, [0, 1], [0, 1]);

        // Action — slide from right, slight delay
        const actionProgress = spring({
          frame: frame - baseDelay - 10,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const actionX = interpolate(actionProgress, [0, 1], [200, 0]);
        const actionOpacity = interpolate(actionProgress, [0, 1], [0, 1]);

        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 400,
                color: "#9ca3af",
                opacity: timeOpacity,
                transform: `translateX(${timeX}px)`,
              }}
            >
              {step.time}
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#ffffff",
                opacity: actionOpacity,
                transform: `translateX(${actionX}px)`,
                marginTop: 8,
              }}
            >
              {step.action}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   REVEAL — "Devizly fait ça." (240–360)
   ═══════════════════════════════════════════ */

const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title scale explosion
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0, 1.1]);
  const titleSettle = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const finalTitleScale =
    frame < 15 ? titleScale : interpolate(titleSettle, [0, 1], [1.1, 1.0]);
  const titleOpacity = interpolate(titleSpring, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle fade-in at frame 60 relative
  const subOpacity = interpolate(frame, [55, 70], [0, 1], {
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
        gap: 20,
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${finalTitleScale})`,
        }}
      >
        Devizly fait ça.
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 400,
          color: "rgba(255,255,255,0.85)",
          opacity: subOpacity,
        }}
      >
        Pour tous tes clients.
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════════ */

export const AdBReveal: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Hook: result first (0–90) */}
      <Sequence from={0} durationInFrames={90} premountFor={10}>
        <HookScene />
      </Sequence>

      {/* Rewind: chronological reverse (90–240) */}
      <Sequence from={90} durationInFrames={150} premountFor={10}>
        <RewindScene />
      </Sequence>

      {/* Reveal: "Devizly fait ça." (240–360) */}
      <Sequence from={240} durationInFrames={120} premountFor={10}>
        <RevealScene />
      </Sequence>

      {/* CTA (360–450) */}
      <Sequence from={360} durationInFrames={90} premountFor={10}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
