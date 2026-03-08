import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

/* -- Colors (matching reference: light bg, dark text) -- */
const C = {
  bg: "#EDEDF0",
  dark: "#1A1A2E",
  muted: "#6B7280",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
};

const font = fontFamily;

/* -- macOS Window Chrome -------------------------------- */

function MacWindow({
  children,
  title = "Devizly",
  style,
}: {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 38,
          background: "#F6F6F8",
          borderBottom: "1px solid #E5E5EA",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          position: "relative",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
        </div>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 13,
            color: "#999",
            fontFamily: font,
          }}
        >
          {title}
        </div>
      </div>
      {/* Content */}
      <div style={{ overflow: "hidden" }}>{children}</div>
    </div>
  );
}

/* -- Typing animation ----------------------------------- */

function TypeText({
  text,
  delay = 0,
  style,
}: {
  text: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - delay);
  const charsPerFrame = 0.6;
  const visibleChars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  const showCursor = elapsed % 16 < 10;

  return (
    <span style={style}>
      {text.slice(0, visibleChars)}
      {visibleChars < text.length && showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: "1.1em",
            background: C.dark,
            marginLeft: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </span>
  );
}

/* -- Logo SVG ------------------------------------------- */

function Logo({ size = 80 }: { size?: number }) {
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

/* -- Scene 0: AI typing prompt (0-4s = 0-120 frames) ---- */

function SceneTyping() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 22, mass: 1 } });
  const y = interpolate(enterProgress, [0, 1], [200, 0]);
  const scale = interpolate(enterProgress, [0, 1], [0.92, 1]);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${y}px) scale(${scale})`,
          width: "88%",
          maxWidth: 860,
        }}
      >
        <MacWindow title="Devizly — Nouveau devis">
          {/* AI prompt bar */}
          <div style={{ padding: "28px 32px", borderBottom: "1px solid #E5E5EA" }}>
            <div
              style={{
                fontSize: 14,
                color: C.muted,
                fontFamily: font,
                marginBottom: 10,
                fontWeight: 600,
              }}
            >
              Generer avec l&apos;IA
            </div>
            <div
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "18px 20px",
                minHeight: 50,
              }}
            >
              <TypeText
                text="Renovation cuisine professionnelle, plan inox 6m, hotte extraction, plomberie complete"
                delay={15}
                style={{
                  fontSize: 18,
                  color: C.dark,
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.violet,
                borderRadius: 10,
                padding: "12px 24px",
                opacity: interpolate(frame, [70, 90], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.white,
                  fontFamily: font,
                }}
              >
                Generer avec l&apos;IA
              </span>
            </div>
          </div>
          {/* Devis lines appearing */}
          <div style={{ padding: "20px 32px 28px" }}>
            <div
              style={{
                fontSize: 13,
                color: C.muted,
                fontFamily: font,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Lignes generees
            </div>
            {[
              { desc: "Plan de travail inox professionnel (6m lineaire)", price: "4 800 EUR" },
              { desc: "Hotte extraction industrielle", price: "5 200 EUR" },
              { desc: "Installation gaz + raccordements", price: "3 600 EUR" },
              { desc: "Revetement sol antiderapant (35m2)", price: "4 200 EUR" },
            ].map((item, i) => (
              <div
                key={item.desc}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #F3F4F6",
                  fontSize: 15,
                  fontFamily: font,
                  opacity: interpolate(frame, [85 + i * 6, 93 + i * 6], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <span style={{ color: C.dark }}>{item.desc}</span>
                <span style={{ color: C.muted, fontWeight: 600 }}>{item.price}</span>
              </div>
            ))}
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 1: Dashboard (4-6s = 120-180 frames) --------- */

function Scene1() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 22, mass: 1 } });
  const y = interpolate(enterProgress, [0, 1], [300, -40]);
  const rotateX = interpolate(enterProgress, [0, 1], [12, 3]);
  const rotateY = interpolate(enterProgress, [0, 1], [-6, -4]);
  const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            fontFamily: font,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          Votre activite, en un coup d&apos;oeil
        </p>
      </div>

      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${y}px) scale(${scale})`,
          width: "92%",
          maxWidth: 960,
        }}
      >
        <MacWindow title="Devizly — Dashboard">
          <Img
            src={staticFile("marketing/final dashboard.png")}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 2: Devis list (6-8s = 180-240 frames) -------- */

function Scene2() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 20, mass: 0.9 } });
  const y = interpolate(enterProgress, [0, 1], [250, -20]);
  const rotateX = interpolate(enterProgress, [0, 1], [10, 3]);
  const rotateY = interpolate(enterProgress, [0, 1], [6, 4]);

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            fontFamily: font,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          Tous vos devis, organises
        </p>
      </div>

      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${y}px)`,
          width: "92%",
          maxWidth: 960,
        }}
      >
        <MacWindow title="Devizly — Devis">
          <Img
            src={staticFile("marketing/devis list.png")}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 3: Devis form + payment (8-10s = 240-300) ---- */

function Scene3() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 20, mass: 0.9 } });
  const y = interpolate(enterProgress, [0, 1], [250, -20]);
  const rotateX = interpolate(enterProgress, [0, 1], [10, 3]);
  const rotateY = interpolate(enterProgress, [0, 1], [-6, -4]);

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            fontFamily: font,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          Signature + paiement en ligne
        </p>
      </div>

      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${y}px)`,
          width: "68%",
          maxWidth: 700,
        }}
      >
        <MacWindow title="Devizly — Devis partage">
          <Img
            src={staticFile("marketing/devis final form .png")}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 4: Client portal (10-11.5s = 300-345) -------- */

function Scene4() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 20, mass: 0.9 } });
  const y = interpolate(enterProgress, [0, 1], [250, -20]);
  const rotateX = interpolate(enterProgress, [0, 1], [10, 3]);
  const rotateY = interpolate(enterProgress, [0, 1], [5, 3]);

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            fontFamily: font,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          Portail client self-service
        </p>
      </div>

      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${y}px)`,
          width: "92%",
          maxWidth: 960,
        }}
      >
        <MacWindow title="Devizly — Clients">
          <Img
            src={staticFile("marketing/portail client .png")}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 5: Bold statement (11.5-13s = 345-390) ------- */

function Scene5() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textProgress = spring({ frame: frame - 5, fps, config: { damping: 25, mass: 0.7 } });
  const scale = interpolate(textProgress, [0, 1], [0.85, 1]);
  const opacity = textProgress;

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", opacity, transform: `scale(${scale})` }}>
        <p
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: C.dark,
            fontFamily: font,
            lineHeight: 1.15,
            letterSpacing: -2,
            margin: 0,
          }}
        >
          Devis pro en 30 secondes
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: C.muted,
            fontFamily: font,
            marginTop: 20,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          IA Mistral — 100% hebergee en France
        </p>
      </div>
    </AbsoluteFill>
  );
}

/* -- Scene 6: CTA (13-15s = 390-450 frames) ------------- */

function Scene6() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1]);

  const textProgress = spring({ frame: frame - 12, fps, config: { damping: 25 } });
  const ctaProgress = spring({ frame: frame - 28, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        {/* Logo */}
        <div style={{ opacity: logoProgress, transform: `scale(${logoScale})`, marginBottom: 28 }}>
          <Logo size={80} />
        </div>

        {/* Brand name */}
        <div style={{ opacity: textProgress }}>
          <p
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: C.dark,
              fontFamily: font,
              letterSpacing: -2,
              margin: 0,
            }}
          >
            Devizly
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: C.muted,
              fontFamily: font,
              marginTop: 8,
            }}
          >
            Essayez gratuitement
          </p>
        </div>

        {/* CTA pill */}
        <div style={{ opacity: ctaProgress, marginTop: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: C.violet,
              borderRadius: 14,
              padding: "16px 40px",
              boxShadow: `0 8px 30px ${C.violet}40`,
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, color: C.white, fontFamily: font }}>
              devizly.fr
            </span>
          </div>
          <p
            style={{
              fontSize: 18,
              color: C.muted,
              fontFamily: font,
              marginTop: 16,
            }}
          >
            Gratuit — Sans carte bancaire
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* -- Main Composition ----------------------------------- */

export const DevizlyAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Scene 0: AI typing prompt (0-4s) */}
      <Sequence from={0} durationInFrames={120}>
        <SceneTyping />
      </Sequence>

      {/* Scene 1: Dashboard overview (4-6s) */}
      <Sequence from={120} durationInFrames={60}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: Devis list (6-8s) */}
      <Sequence from={180} durationInFrames={60}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: Devis form + payment (8-10s) */}
      <Sequence from={240} durationInFrames={60}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: Client portal (10-11.5s) */}
      <Sequence from={300} durationInFrames={45}>
        <Scene4 />
      </Sequence>

      {/* Scene 5: Bold statement (11.5-13s) */}
      <Sequence from={345} durationInFrames={45}>
        <Scene5 />
      </Sequence>

      {/* Scene 6: Logo + CTA (13-15s) */}
      <Sequence from={390} durationInFrames={60}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
