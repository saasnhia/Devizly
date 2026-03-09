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
   HOOK — Persona callout typewriter (0–90)
   ═══════════════════════════════════════════ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const line1 = "Freelance français ?";
  const charsPer = 1 / 4; // 4 frames per char
  const line1Chars = Math.min(line1.length, Math.floor(frame * charsPer));
  const typedLine1 = line1.slice(0, line1Chars);
  const line1Done = line1Chars >= line1.length;

  // Line 2 appears at frame 70
  const line2Opacity = interpolate(frame, [70, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [70, 82], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor blink
  const cursorOpacity = interpolate(
    frame % 16,
    [0, 8, 16],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 20,
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {typedLine1}
        {!line1Done && (
          <span style={{ color: "#7c3aed", opacity: cursorOpacity }}>▌</span>
        )}
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 400,
          color: "#4b5563",
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
        }}
      >
        Regarde ça. 👇
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   Phone Mockup SVG
   ═══════════════════════════════════════════ */

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        width: 340,
        height: 620,
        borderRadius: 36,
        border: "3px solid #e5e7eb",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 28,
          backgroundColor: "#000000",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          zIndex: 10,
        }}
      />
      {/* Content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          paddingTop: 36,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Screen 1 — "Nouveau devis" (30–110)
   ═══════════════════════════════════════════ */

const Screen1: React.FC = () => {
  const frame = useCurrentFrame();

  const fields = [
    { label: "Client", value: "Martin & Co", delay: 15 },
    { label: "Prestation", value: "Développement web", delay: 35 },
    { label: "Montant", value: "1 200 €", delay: 55 },
  ];

  return (
    <div style={{ padding: 16, fontFamily }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Nouveau devis
        </span>
        <div
          style={{
            backgroundColor: "#7c3aed",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            padding: "6px 12px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ✨ Générer par IA
        </div>
      </div>

      {/* Fields */}
      {fields.map((f, i) => {
        const chars = Math.max(
          0,
          Math.min(f.value.length, Math.floor((frame - f.delay) / 3))
        );
        const typed = f.value.slice(0, chars);

        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 4,
              }}
            >
              {f.label}
            </div>
            <div
              style={{
                border: "2px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 16,
                fontWeight: 400,
                color: "#111827",
                minHeight: 24,
              }}
            >
              {typed}
              {chars < f.value.length && frame >= f.delay && (
                <span style={{ color: "#7c3aed" }}>|</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Screen 2 — "Devis envoyé" (110–190)
   ═══════════════════════════════════════════ */

const Screen2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const badgeScaleVal = interpolate(badgeScale, [0, 1], [0, 1]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 16,
      }}
    >
      <div
        style={{
          backgroundColor: "#dcfce7",
          color: "#16a34a",
          fontSize: 18,
          fontWeight: 700,
          padding: "10px 20px",
          borderRadius: 12,
          transform: `scale(${badgeScaleVal})`,
        }}
      >
        ✅ Envoyé
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Client notifié par email
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#111827",
          marginTop: 8,
        }}
      >
        Martin & Co — 1 200 €
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Screen 3 — "Facture générée" (190–270)
   ═══════════════════════════════════════════ */

const Screen3: React.FC = () => {
  const frame = useCurrentFrame();

  // Badge pulse
  const pulsePhase = Math.max(0, frame - 20);
  const badgePulse = 1 + 0.06 * Math.sin((pulsePhase / 20) * Math.PI * 2);

  const badgeOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        padding: 16,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#9ca3af",
        }}
      >
        Facture générée
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        INV-2026-001
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#16a34a",
        }}
      >
        1 200 €
      </div>
      <div
        style={{
          backgroundColor: "#fef3c7",
          color: "#d97706",
          fontSize: 16,
          fontWeight: 700,
          padding: "8px 16px",
          borderRadius: 10,
          opacity: badgeOpacity,
          transform: `scale(${frame >= 20 ? badgePulse : 0})`,
        }}
      >
        💰 Payé
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DEMO SCENE — Phone with screen sequence (90–360)
   ═══════════════════════════════════════════ */

const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides up
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [800, 0]);

  // Screen transitions via slide
  const screenIdx = frame < 110 ? 0 : frame < 190 ? 1 : 2;

  // Slide transition offset for screens
  const slide1 = interpolate(frame, [105, 120], [0, -340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slide2 = interpolate(frame, [185, 200], [0, -340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating label
  const labelOpacity = interpolate(frame, [120, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelX = interpolate(frame, [120, 135], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f9fafb",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
      }}
    >
      {/* Phone */}
      <div style={{ transform: `translateY(${phoneY}px)` }}>
        <PhoneFrame>
          <div
            style={{
              display: "flex",
              width: 340 * 3,
              height: "100%",
              transform: `translateX(${screenIdx === 0 ? slide1 : screenIdx === 1 ? -340 + slide2 : -680}px)`,
            }}
          >
            <div style={{ width: 340, height: "100%", flexShrink: 0 }}>
              <Screen1 />
            </div>
            <div style={{ width: 340, height: "100%", flexShrink: 0 }}>
              <Screen2 />
            </div>
            <div style={{ width: 340, height: "100%", flexShrink: 0 }}>
              <Screen3 />
            </div>
          </div>
        </PhoneFrame>
      </div>

      {/* Floating label */}
      <div
        style={{
          marginTop: 30,
          backgroundColor: "#111827",
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 700,
          padding: "14px 28px",
          borderRadius: 12,
          opacity: labelOpacity,
          transform: `translateX(${labelX}px)`,
        }}
      >
        Tout ça en 30 secondes
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════════ */

export const AdCDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Hook: typewriter persona (0–90) */}
      <Sequence from={0} durationInFrames={90} premountFor={10}>
        <HookScene />
      </Sequence>

      {/* Demo: phone mockup sequence (90–360) */}
      <Sequence from={90} durationInFrames={270} premountFor={10}>
        <DemoScene />
      </Sequence>

      {/* CTA (360–450) */}
      <Sequence from={360} durationInFrames={90} premountFor={10}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
