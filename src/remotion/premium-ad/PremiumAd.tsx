import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { FloatingScreen } from "./components/FloatingScreen";
import { Callout } from "./components/Callout";
import { CTAScene } from "./components/CTAScene";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500", "700", "800", "900"],
  subsets: ["latin"],
});

/* ═══════════════════════════════════════════════════════════
   Background — shared dark + violet radial glow
   ═══════════════════════════════════════════════════════════ */

const DarkBackground: React.FC = () => (
  <>
    <AbsoluteFill style={{ backgroundColor: "#08080f" }} />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 20% 15%, rgba(124,58,237,0.15), transparent)",
      }}
    />
  </>
);

/* ═══════════════════════════════════════════════════════════
   SCENE 1 — Hook kinetic typography (0–90)
   ═══════════════════════════════════════════════════════════ */

function HookScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    {
      text: "Tu passes encore",
      delay: 5,
      size: 52,
      weight: 700 as const,
      color: "#a1a1aa",
      glow: false,
    },
    {
      text: "2 heures",
      delay: 20,
      size: 96,
      weight: 900 as const,
      color: "#ffffff",
      glow: true,
    },
    {
      text: "sur chaque devis.",
      delay: 40,
      size: 52,
      weight: 700 as const,
      color: "#a1a1aa",
      glow: false,
    },
  ];

  const lineScaleX = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <DarkBackground />

      {lines.map((line, i) => {
        const progress = spring({
          frame: frame - line.delay,
          fps,
          config: { damping: 14, stiffness: 200 },
        });
        const y = interpolate(progress, [0, 1], [40, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div key={i} style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: line.size,
                fontWeight: line.weight,
                color: line.color,
                letterSpacing: "-0.04em",
                opacity,
                transform: `translateY(${y}px)`,
                textShadow: line.glow
                  ? "0 0 40px rgba(124,58,237,0.4)"
                  : "none",
                textAlign: "center",
              }}
            >
              {line.text}
            </div>
            {line.glow && (
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: "10%",
                  right: "10%",
                  height: 2,
                  backgroundColor: "#7c3aed",
                  transform: `scaleX(${lineScaleX})`,
                  transformOrigin: "center",
                }}
              />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 2 — Dashboard screenshot floating (90–180)
   ═══════════════════════════════════════════════════════════ */

function DashboardScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge "✨ IA génère en 30s" at frame 40 (global ~130)
  const badgeProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const badgeY = interpolate(badgeProgress, [0, 1], [-40, 0]);
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);

  // "30 secondes" at frame 60 (global ~150)
  const labelProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const labelScale = interpolate(labelProgress, [0, 1], [0, 1]);
  const labelOpacity = interpolate(labelProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <DarkBackground />

      {/* Badge */}
      <div
        style={{
          backgroundColor: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.4)",
          borderRadius: 999,
          padding: "10px 24px",
          fontSize: 28,
          fontWeight: 700,
          color: "#ffffff",
          opacity: badgeOpacity,
          transform: `translateY(${badgeY}px)`,
          zIndex: 1,
        }}
      >
        ✨ IA génère en 30s
      </div>

      {/* Floating screenshot */}
      <div style={{ zIndex: 1, width: "100%" }}>
        <FloatingScreen
          src="marketing/final dashboard.png"
          frame={frame}
          fps={fps}
        />
      </div>

      {/* "30 secondes" */}
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: "#22c55e",
          letterSpacing: "-0.04em",
          opacity: labelOpacity,
          transform: `scale(${labelScale})`,
          zIndex: 1,
        }}
      >
        30 secondes
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 3 — Devis client + feature callouts (180–300)
   ═══════════════════════════════════════════════════════════ */

function DevisClientScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard exits left (frames 0-20)
  const dashExitX = interpolate(frame, [0, 20], [0, -120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashExitOpacity = interpolate(frame, [0, 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Screenshot fade-out at end (frames 100-120)
  const screenOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const callouts = [
    { text: "✍️ Client signe depuis son téléphone", delay: 20 },
    { text: "💸 Paiement Stripe intégré", delay: 40 },
    { text: "🧾 Facture créée automatiquement", delay: 60 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DarkBackground />

      {/* Dashboard exiting left */}
      {frame < 25 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: dashExitOpacity,
            transform: `translateX(${dashExitX}%)`,
            zIndex: 1,
          }}
        >
          <Img
            src={staticFile("marketing/final dashboard.png")}
            style={{
              width: "88%",
              maxWidth: 900,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 0 80px rgba(124,58,237,0.35), 0 40px 120px rgba(0,0,0,0.8)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Side-by-side layout: screenshot left + callouts right */}
      {frame >= 5 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "0 32px",
            opacity: screenOpacity,
            zIndex: 1,
          }}
        >
          {/* Screenshot — 55% width */}
          <div style={{ width: "55%", flexShrink: 0 }}>
            <FloatingScreen
              src="marketing/devis client.png"
              frame={frame}
              fps={fps}
              entryDelay={10}
              mirrorTilt
              violetFrame
              screenWidth="100%"
            />
          </div>

          {/* Callouts — 40% width, on dark background */}
          <div
            style={{
              width: "40%",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {callouts.map((c, i) => (
              <Callout
                key={i}
                text={c.text}
                frame={frame}
                fps={fps}
                delay={c.delay}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 4 — Stat counter "30s" (300–390)
   ═══════════════════════════════════════════════════════════ */

function StatScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter 0→30
  const counterVal = interpolate(frame, [0, 60], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Number scale explosion
  const numSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0, 1.05]);
  const numSettle = spring({
    frame: frame - 18,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const finalScale =
    frame < 18 ? numScale : interpolate(numSettle, [0, 1], [1.05, 1.0]);
  const numOpacity = interpolate(numSpring, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "s" suffix at frame 60
  const sProgress = spring({
    frame: frame - 58,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const sOpacity = interpolate(sProgress, [0, 1], [0, 1]);
  const sScale = interpolate(sProgress, [0, 1], [0.5, 1]);

  // Subtext at frame 60
  const subOpacity = interpolate(frame, [58, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Italic at frame 75
  const italicOpacity = interpolate(frame, [73, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <DarkBackground />

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          opacity: numOpacity,
          transform: `scale(${finalScale})`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {Math.round(counterVal)}
        </div>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            color: "#7c3aed",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            opacity: sOpacity,
            transform: `scale(${sScale})`,
          }}
        >
          s
        </div>
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: "#a1a1aa",
          opacity: subOpacity,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        pour créer et envoyer votre devis
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 400,
          fontStyle: "italic",
          color: "#6b7280",
          opacity: italicOpacity,
          marginTop: 8,
          zIndex: 1,
        }}
      >
        Pendant que tes concurrents ouvrent Excel.
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════════════════════════ */

export const PremiumAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#08080f" }}>
      <Sequence from={0} durationInFrames={95} premountFor={10}>
        <HookScene />
      </Sequence>

      <Sequence from={90} durationInFrames={95} premountFor={10}>
        <DashboardScene />
      </Sequence>

      <Sequence from={180} durationInFrames={125} premountFor={10}>
        <DevisClientScene />
      </Sequence>

      <Sequence from={300} durationInFrames={95} premountFor={10}>
        <StatScene />
      </Sequence>

      <Sequence from={390} durationInFrames={60} premountFor={10}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
