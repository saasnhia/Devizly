import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/* ── Brand colors ─────────────────────────────────── */
const C = {
  bg: "#0A0A0A",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
  whiteAlpha: "rgba(255,255,255,0.7)",
  whiteAlpha2: "rgba(255,255,255,0.12)",
};

/* ── Helpers ──────────────────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame: frame - delay, fps, config: { damping: 30 } });
  const y = interpolate(opacity, [0, 1], [40, 0]);
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
}

function SlideIn({
  children,
  delay = 0,
  from = "left",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "left" | "right";
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 25, mass: 0.8 } });
  const dir = from === "left" ? -1 : 1;
  const x = interpolate(progress, [0, 1], [120 * dir, 0]);
  return (
    <div style={{ opacity: progress, transform: `translateX(${x}px)`, ...style }}>
      {children}
    </div>
  );
}

function ScaleIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, mass: 0.6 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  return (
    <div style={{ opacity: progress, transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
}

function GradientText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        background: `linear-gradient(135deg, ${C.violet}, ${C.emerald})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Logo SVG ─────────────────────────────────────── */

function Logo({ size = 80 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
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

/* ── Glow background ──────────────────────────────── */

function GlowBg() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 30) * 0.15 + 0.85;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Violet glow top-left */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet}25, transparent 70%)`,
          opacity: pulse,
        }}
      />
      {/* Emerald glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.emerald}20, transparent 70%)`,
          opacity: pulse,
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </AbsoluteFill>
  );
}

/* ── Scene 1: Logo reveal (0-3s = 0-90 frames) ───── */

function Scene1() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame, fps, config: { damping: 15, mass: 0.8 } });
  const textOpacity = spring({ frame: frame - 20, fps, config: { damping: 30 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GlowBg />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        <div style={{ transform: `scale(${logoScale})` }}>
          <Logo size={140} />
        </div>
        <div
          style={{
            opacity: textOpacity,
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: C.white,
              letterSpacing: -2,
              fontFamily: "sans-serif",
            }}
          >
            Devizly
          </span>
        </div>
        <FadeIn delay={35}>
          <p
            style={{
              fontSize: 28,
              color: C.whiteAlpha,
              marginTop: 16,
              fontFamily: "sans-serif",
            }}
          >
            Devis IA en 30 secondes
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 2: Problem (3-6s = 90-180 frames) ─────── */

function Scene2() {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, padding: 60, textAlign: "center" }}>
        <FadeIn>
          <p
            style={{
              fontSize: 36,
              color: C.whiteAlpha,
              fontFamily: "sans-serif",
              marginBottom: 20,
            }}
          >
            Vous perdez encore
          </p>
        </FadeIn>
        <FadeIn delay={12}>
          <p
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: C.white,
              fontFamily: "sans-serif",
              lineHeight: 1.1,
            }}
          >
            <GradientText>45 minutes</GradientText>
          </p>
        </FadeIn>
        <FadeIn delay={24}>
          <p
            style={{
              fontSize: 36,
              color: C.whiteAlpha,
              fontFamily: "sans-serif",
              marginTop: 20,
            }}
          >
            par devis ?
          </p>
        </FadeIn>

        {/* Strikethrough animation */}
        <FadeIn delay={45}>
          <div
            style={{
              marginTop: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 30,
            }}
          >
            <span
              style={{
                fontSize: 42,
                color: "rgba(255,255,255,0.3)",
                textDecoration: "line-through",
                fontFamily: "sans-serif",
              }}
            >
              Word / Excel
            </span>
            <span style={{ fontSize: 42, color: C.emerald, fontFamily: "sans-serif" }}>
              {"->"}
            </span>
            <span
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: C.emerald,
                fontFamily: "sans-serif",
              }}
            >
              30 secondes
            </span>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 3: Features (6-10s = 180-300 frames) ──── */

function Scene3() {
  const features = [
    { icon: "AI", label: "IA Mistral francaise", color: C.violet },
    { icon: "PDF", label: "Export PDF pro", color: C.emerald },
    { icon: "WA", label: "Partage WhatsApp", color: C.violet },
    { icon: "OK", label: "Signature 1-clic", color: C.emerald },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, padding: 60 }}>
        <FadeIn>
          <p
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: C.white,
              textAlign: "center",
              fontFamily: "sans-serif",
              marginBottom: 50,
            }}
          >
            Tout-en-un
          </p>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {features.map((f, i) => (
            <SlideIn key={f.label} delay={15 + i * 12} from={i % 2 === 0 ? "left" : "right"}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  background: C.whiteAlpha2,
                  borderRadius: 16,
                  padding: "24px 30px",
                  border: `1px solid ${f.color}30`,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `${f.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: f.color,
                    fontFamily: "sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: C.white,
                    fontFamily: "sans-serif",
                  }}
                >
                  {f.label}
                </span>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 4: Metrics (10-13s = 300-390 frames) ──── */

function Scene4() {
  const metrics = [
    { value: "+80%", label: "plus rapide", color: C.emerald },
    { value: "3x", label: "plus de signatures", color: C.violet },
    { value: "2x", label: "plus vite paye", color: C.emerald },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, padding: 60, textAlign: "center" }}>
        <FadeIn>
          <p
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: C.whiteAlpha,
              fontFamily: "sans-serif",
              marginBottom: 50,
            }}
          >
            Des resultats concrets
          </p>
        </FadeIn>
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          {metrics.map((m, i) => (
            <ScaleIn key={m.value} delay={15 + i * 15}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 200,
                }}
              >
                <span
                  style={{
                    fontSize: 80,
                    fontWeight: 900,
                    color: m.color,
                    fontFamily: "sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    color: C.whiteAlpha,
                    fontFamily: "sans-serif",
                  }}
                >
                  {m.label}
                </span>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 5: CTA (13-15s = 390-450 frames) ──────── */

function Scene5() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = Math.sin(frame / 8) * 3;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, textAlign: "center" }}>
        <ScaleIn>
          <Logo size={100} />
        </ScaleIn>
        <FadeIn delay={10}>
          <p
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: C.white,
              fontFamily: "sans-serif",
              marginTop: 30,
              lineHeight: 1.2,
            }}
          >
            Essayez{" "}
            <GradientText>gratuitement</GradientText>
          </p>
        </FadeIn>
        <FadeIn delay={25}>
          <div
            style={{
              marginTop: 40,
              transform: `translateY(${pulse}px)`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: `linear-gradient(135deg, ${C.violet}, ${C.emerald})`,
                borderRadius: 16,
                padding: "22px 50px",
                boxShadow: `0 10px 40px ${C.violet}40`,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.white,
                  fontFamily: "sans-serif",
                }}
              >
                devizly.com
              </span>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={38}>
          <p
            style={{
              fontSize: 22,
              color: C.whiteAlpha,
              marginTop: 24,
              fontFamily: "sans-serif",
            }}
          >
            Gratuit - Sans carte bancaire
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Main Composition ─────────────────────────────── */

export const DevizlyAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Scene 1: Logo reveal (0-3s) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: Problem statement (3-6s) */}
      <Sequence from={90} durationInFrames={90}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: Features grid (6-10s) */}
      <Sequence from={180} durationInFrames={120}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: Metrics (10-13s) */}
      <Sequence from={300} durationInFrames={90}>
        <Scene4 />
      </Sequence>

      {/* Scene 5: CTA (13-15s) */}
      <Sequence from={390} durationInFrames={60}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
