import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════ */
const C = {
  bg: "#EDEDF0",
  dark: "#1A1A2E",
  muted: "#6B7280",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
  lightBg: "#F8F9FC",
};

const font = fontFamily;

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

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
        borderRadius: 16,
        overflow: "hidden",
        boxShadow:
          "0 25px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      <div
        style={{
          height: 40,
          background: "#F6F6F8",
          borderBottom: "1px solid #E5E5EA",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FF5F57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FEBC2E",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28C840",
            }}
          />
        </div>
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
      <div style={{ overflow: "hidden" }}>{children}</div>
    </div>
  );
}

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
  const charsPerFrame = 0.8;
  const visibleChars = Math.min(
    Math.floor(elapsed * charsPerFrame),
    text.length,
  );
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
            background: C.violet,
            marginLeft: 2,
            verticalAlign: "text-bottom",
            borderRadius: 2,
          }}
        />
      )}
    </span>
  );
}

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

/** Animated subtitle with spring + fade */
function SceneTitle({
  text,
  sub,
  delayFrames = 0,
}: {
  text: string;
  sub?: string;
  delayFrames?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 200 },
  });
  const y = interpolate(titleProgress, [0, 1], [30, 0]);

  const subOpacity = interpolate(
    frame,
    [delayFrames + 15, delayFrames + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        flexShrink: 0,
        paddingTop: 30,
        paddingBottom: 16,
      }}
    >
      <p
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: C.dark,
          fontFamily: font,
          letterSpacing: -2,
          margin: 0,
          opacity: titleProgress,
          transform: `translateY(${y}px)`,
        }}
      >
        {text}
      </p>
      {sub && (
        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: C.muted,
            fontFamily: font,
            marginTop: 8,
            opacity: subOpacity,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/** Screenshot in MacWindow with 3D enter animation */
function ScreenshotScene({
  title,
  subtitle,
  windowTitle,
  imagePath,
  rotateDir = "right",
  windowWidth = "96%",
}: {
  title: string;
  subtitle?: string;
  windowTitle: string;
  imagePath: string;
  rotateDir?: "left" | "right";
  windowWidth?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const y = interpolate(enterProgress, [0, 1], [200, -10]);
  const rotateX = interpolate(enterProgress, [0, 1], [8, 2]);
  const rotateY = interpolate(
    enterProgress,
    [0, 1],
    rotateDir === "right" ? [-4, -1] : [4, 1],
  );
  const scale = interpolate(enterProgress, [0, 1], [0.95, 1.02]);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <SceneTitle text={title} sub={subtitle} />
      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${y}px) scale(${scale})`,
          width: windowWidth,
          maxWidth: 1100,
        }}
      >
        <MacWindow title={windowTitle}>
          <Img
            src={staticFile(imagePath)}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 0: INTRO — Logo + Tagline (0-3s = 0-90 frames)
   ═══════════════════════════════════════════════════ */
function SceneIntro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  const nameProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });

  const taglineOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeY = interpolate(frame, [55, 70], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            opacity: logoProgress,
            transform: `scale(${logoScale})`,
            marginBottom: 24,
          }}
        >
          <Logo size={100} />
        </div>

        <div style={{ opacity: nameProgress }}>
          <p
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.dark,
              fontFamily: font,
              letterSpacing: -3,
              margin: 0,
            }}
          >
            Devizly
          </p>
        </div>

        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: C.muted,
            fontFamily: font,
            marginTop: 12,
            opacity: taglineOpacity,
          }}
        >
          Devis professionnels en 30 secondes avec l&apos;IA
        </p>

        <div
          style={{
            marginTop: 20,
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `${C.emerald}20`,
              border: `1px solid ${C.emerald}40`,
              borderRadius: 30,
              padding: "8px 20px",
              fontSize: 16,
              fontWeight: 600,
              color: C.emerald,
              fontFamily: font,
            }}
          >
            <span style={{ fontSize: 14 }}>🇫🇷</span> IA hebergee en France
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 1: AI TYPING (3-12s = 90-360 frames)
   ═══════════════════════════════════════════════════ */
function SceneAITyping() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 22, mass: 1 } });
  const y = interpolate(enterProgress, [0, 1], [200, 0]);
  const scale = interpolate(enterProgress, [0, 1], [0.92, 1]);

  // Button appears after typing finishes
  const btnOpacity = interpolate(frame, [120, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Loading spinner after click
  const spinnerOpacity = interpolate(frame, [150, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lines appear one by one
  const lines = [
    {
      desc: "Plan de travail inox professionnel (6m lineaire)",
      price: "4 800 €",
    },
    { desc: "Hotte extraction industrielle", price: "5 200 €" },
    { desc: "Installation gaz + raccordements", price: "3 600 €" },
    { desc: "Revetement sol antiderapant (35m²)", price: "4 200 €" },
    { desc: "Plonge double bac + lave-vaisselle pro", price: "4 800 €" },
    { desc: "Mise aux normes electrique", price: "3 000 €" },
  ];

  // Total appears
  const totalOpacity = interpolate(frame, [230, 245], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const totalScale = spring({
    frame: frame - 235,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <SceneTitle
        text="Generation IA en temps reel"
        sub="Decrivez votre prestation, l'IA fait le reste"
      />
      <div
        style={{
          transform: `translateY(${y}px) scale(${scale})`,
          width: "96%",
          maxWidth: 1100,
        }}
      >
        <MacWindow title="Devizly — Nouveau devis">
          {/* AI prompt area */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #E5E5EA" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                color: C.violet,
                fontFamily: font,
                marginBottom: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 20 }}>✨</span> Generer avec l&apos;IA
            </div>
            <div
              style={{
                background: "#F9FAFB",
                border: `2px solid ${C.violet}30`,
                borderRadius: 12,
                padding: "18px 20px",
                minHeight: 50,
              }}
            >
              <TypeText
                text="Renovation complete d'une cuisine professionnelle pour un restaurant gastronomique a Bordeaux. Plan de travail inox 6m lineaire, hotte extraction industrielle, installation gaz et raccordements, revetement sol antiderapant 35m², plonge double bac avec lave-vaisselle pro, mise aux normes electrique."
                delay={15}
                style={{
                  fontSize: 20,
                  color: C.dark,
                  fontFamily: font,
                  lineHeight: 1.6,
                }}
              />
            </div>
            {/* Generate button */}
            <div
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.violet,
                borderRadius: 10,
                padding: "12px 24px",
                opacity: btnOpacity,
                boxShadow: `0 4px 15px ${C.violet}40`,
              }}
            >
              <span style={{ fontSize: 18 }}>✨</span>
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

          {/* Loading indicator */}
          {frame >= 150 && frame < 175 && (
            <div
              style={{
                padding: "16px 32px",
                textAlign: "center",
                opacity: spinnerOpacity,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: C.violet,
                  fontFamily: font,
                  fontWeight: 600,
                }}
              >
                ⏳ L&apos;IA analyse votre demande...
              </span>
            </div>
          )}

          {/* Generated lines */}
          <div style={{ padding: "16px 32px 20px" }}>
            {/* Header row */}
            {frame >= 175 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "2px solid #E5E7EB",
                  fontSize: 13,
                  fontFamily: font,
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: 0.5,
                  opacity: interpolate(frame, [175, 180], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <span>Description</span>
                <span>Prix</span>
              </div>
            )}
            {lines.map((item, i) => {
              const lineStart = 180 + i * 8;
              const lineOpacity = interpolate(
                frame,
                [lineStart, lineStart + 8],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const lineY = interpolate(
                frame,
                [lineStart, lineStart + 8],
                [10, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <div
                  key={item.desc}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #F3F4F6",
                    fontSize: 18,
                    fontFamily: font,
                    opacity: lineOpacity,
                    transform: `translateY(${lineY}px)`,
                  }}
                >
                  <span style={{ color: C.dark }}>{item.desc}</span>
                  <span style={{ color: C.violet, fontWeight: 700 }}>
                    {item.price}
                  </span>
                </div>
              );
            })}

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0 8px",
                fontSize: 26,
                fontFamily: font,
                fontWeight: 800,
                opacity: totalOpacity,
                transform: `scale(${interpolate(totalScale, [0, 1], [0.95, 1])})`,
              }}
            >
              <span style={{ color: C.dark }}>Total TTC</span>
              <span style={{ color: C.emerald }}>30 720,00 €</span>
            </div>
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 2: DASHBOARD (12-20s)
   ═══════════════════════════════════════════════════ */
function SceneDashboard() {
  return (
    <ScreenshotScene
      title="Tableau de bord complet"
      subtitle="CA, conversion, top clients — tout en un coup d'oeil"
      windowTitle="Devizly — Dashboard"
      imagePath="marketing/dashboard devizly.png"
      rotateDir="right"
    />
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 3: DEVIS LIST (20-27s)
   ═══════════════════════════════════════════════════ */
function SceneDevisList() {
  return (
    <ScreenshotScene
      title="Tous vos devis, organises"
      subtitle="Statuts, relances, tracking de lecture — rien ne vous echappe"
      windowTitle="Devizly — Devis"
      imagePath="marketing/relance.png"
      rotateDir="left"
    />
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 4: PIPELINE (27-35s)
   ═══════════════════════════════════════════════════ */
function ScenePipeline() {
  return (
    <ScreenshotScene
      title="Pipeline visuel Kanban"
      subtitle="Prospect → Envoye → Signe → Paye"
      windowTitle="Devizly — Pipeline"
      imagePath="marketing/pipeline.png"
      rotateDir="right"
    />
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 5: AI CREATION FORM (35-43s)
   ═══════════════════════════════════════════════════ */
function SceneAIForm() {
  return (
    <ScreenshotScene
      title="Creation intelligente"
      subtitle="L'IA comprend votre metier et structure le devis"
      windowTitle="Devizly — Nouveau devis"
      imagePath="marketing/création IA devis .png"
      rotateDir="left"
    />
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 6: CLIENT VIEW (43-52s)
   ═══════════════════════════════════════════════════ */
function SceneClientView() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const y = interpolate(enterProgress, [0, 1], [200, -10]);
  const rotateX = interpolate(enterProgress, [0, 1], [8, 1]);
  const scale = interpolate(enterProgress, [0, 1], [0.95, 1.0]);

  // Highlight the sign + pay buttons
  const highlightOpacity = interpolate(frame, [60, 80], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <SceneTitle
        text="Signature + paiement en ligne"
        sub="Votre client signe et paie depuis son navigateur"
      />
      <div
        style={{
          transform: `perspective(1400px) rotateX(${rotateX}deg) translateY(${y}px) scale(${scale})`,
          width: "55%",
          maxWidth: 650,
          position: "relative",
        }}
      >
        <MacWindow title="Devizly — Devis partage">
          <Img
            src={staticFile("marketing/devis client.png")}
            style={{ width: "100%", display: "block" }}
          />
        </MacWindow>
        {/* Glow effect on CTA */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "10%",
            right: "10%",
            height: 50,
            background: `linear-gradient(90deg, ${C.emerald}00, ${C.emerald}60, ${C.emerald}00)`,
            borderRadius: 12,
            opacity: highlightOpacity,
            filter: "blur(15px)",
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 7: SHARE DIALOG (52-58s)
   ═══════════════════════════════════════════════════ */
function SceneShare() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 20, mass: 0.8 },
  });
  const scale = interpolate(enterProgress, [0, 1], [0.8, 1]);

  // Features appear one by one
  const features = [
    { icon: "🔗", text: "Lien direct" },
    { icon: "📱", text: "WhatsApp" },
    { icon: "📧", text: "Email" },
    { icon: "💬", text: "SMS" },
    { icon: "📄", text: "QR Code" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <SceneTitle
        text="Partagez en un clic"
        sub="Email, WhatsApp, SMS, lien direct ou QR code"
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          marginTop: 10,
        }}
      >
        {/* Share dialog screenshot */}
        <div
          style={{
            transform: `scale(${scale})`,
            opacity: enterProgress,
            width: 420,
          }}
        >
          <MacWindow title="Partager le devis">
            <Img
              src={staticFile("marketing/lien.png")}
              style={{ width: "100%", display: "block" }}
            />
          </MacWindow>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {features.map((f, i) => {
            const delay = 20 + i * 10;
            const pillOpacity = interpolate(
              frame,
              [delay, delay + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const pillX = interpolate(
              frame,
              [delay, delay + 10],
              [30, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: C.white,
                  borderRadius: 12,
                  padding: "12px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  opacity: pillOpacity,
                  transform: `translateX(${pillX}px)`,
                }}
              >
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.dark,
                    fontFamily: font,
                  }}
                >
                  {f.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 8: CLIENTS (58-65s)
   ═══════════════════════════════════════════════════ */
function SceneClients() {
  return (
    <ScreenshotScene
      title="Gestion clients centralisee"
      subtitle="Portail client, SIRET, coordonnees — tout au meme endroit"
      windowTitle="Devizly — Clients"
      imagePath="marketing/portail client .png"
      rotateDir="left"
    />
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 9: STRIPE CONNECT (65-72s)
   ═══════════════════════════════════════════════════ */
function SceneStripe() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 22, mass: 1 },
  });
  const y = interpolate(enterProgress, [0, 1], [200, 0]);

  // Feature cards
  const cards = [
    { icon: "💳", title: "Carte bancaire", desc: "Visa, Mastercard, Amex" },
    { icon: "🏦", title: "Virement", desc: "Sous 48h sur votre compte" },
    { icon: "🔒", title: "100% securise", desc: "Chiffrement SSL Stripe" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <SceneTitle
        text="Encaissement automatique"
        sub="Stripe Connect — l'argent arrive directement sur votre compte"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          marginTop: 10,
          transform: `translateY(${y}px)`,
          opacity: enterProgress,
        }}
      >
        {/* Stripe section screenshot */}
        <div style={{ width: "85%", maxWidth: 900 }}>
          <MacWindow title="Devizly — Parametres">
            <Img
              src={staticFile("marketing/stripe.png")}
              style={{ width: "100%", display: "block" }}
            />
          </MacWindow>
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", gap: 20 }}>
          {cards.map((card, i) => {
            const delay = 30 + i * 12;
            const cardProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });
            return (
              <div
                key={card.title}
                style={{
                  background: C.white,
                  borderRadius: 16,
                  padding: "20px 28px",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                  opacity: cardProgress,
                  transform: `translateY(${interpolate(cardProgress, [0, 1], [20, 0])}px)`,
                  width: 200,
                }}
              >
                <span style={{ fontSize: 32 }}>{card.icon}</span>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.dark,
                    fontFamily: font,
                    margin: "8px 0 4px",
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: C.muted,
                    fontFamily: font,
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 10: FEATURES RECAP (72-80s)
   ═══════════════════════════════════════════════════ */
function SceneFeatures() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: "✨", text: "Generation IA" },
    { icon: "📊", text: "Dashboard analytique" },
    { icon: "📋", text: "Pipeline Kanban" },
    { icon: "✍️", text: "Signature electronique" },
    { icon: "💳", text: "Paiement Stripe" },
    { icon: "🔔", text: "Relances automatiques" },
    { icon: "📄", text: "PDF professionnel" },
    { icon: "👥", text: "Portail client" },
  ];

  return (
    <AbsoluteFill
      style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: C.dark,
            fontFamily: font,
            letterSpacing: -2,
            margin: "0 0 40px",
            opacity: spring({ frame, fps, config: { damping: 200 } }),
          }}
        >
          Tout ce qu&apos;il vous faut
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            maxWidth: 800,
          }}
        >
          {features.map((f, i) => {
            const delay = 10 + i * 6;
            const itemProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 20, stiffness: 200 },
            });
            const itemScale = interpolate(itemProgress, [0, 1], [0.7, 1]);
            return (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: C.white,
                  borderRadius: 14,
                  padding: "14px 24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  opacity: itemProgress,
                  transform: `scale(${itemScale})`,
                }}
              >
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.dark,
                    fontFamily: font,
                  }}
                >
                  {f.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 11: BOLD STATEMENT (80-85s)
   ═══════════════════════════════════════════════════ */
function SceneBold() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 25, mass: 0.7 },
  });
  const scale = interpolate(textProgress, [0, 1], [0.85, 1]);

  const statsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stats = [
    { value: "30s", label: "pour generer un devis" },
    { value: "0€", label: "pour commencer" },
    { value: "100%", label: "heberge en France" },
  ];

  return (
    <AbsoluteFill
      style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ opacity: textProgress, transform: `scale(${scale})` }}>
          <p
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: C.dark,
              fontFamily: font,
              lineHeight: 1.15,
              letterSpacing: -2,
              margin: 0,
            }}
          >
            Arretez de perdre du temps
            <br />
            sur vos devis
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
            marginTop: 40,
            opacity: statsOpacity,
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: C.violet,
                  fontFamily: font,
                  margin: 0,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: C.muted,
                  fontFamily: font,
                  marginTop: 4,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 12: CTA (85-90s)
   ═══════════════════════════════════════════════════ */
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.6 },
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1]);

  const textProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
  });

  const ctaProgress = spring({
    frame: frame - 28,
    fps,
    config: { damping: 20 },
  });

  const pulseScale =
    1 + 0.03 * Math.sin(((frame - 40) / 30) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{ background: C.bg, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            opacity: logoProgress,
            transform: `scale(${logoScale})`,
            marginBottom: 28,
          }}
        >
          <Logo size={90} />
        </div>

        <div style={{ opacity: textProgress }}>
          <p
            style={{
              fontSize: 60,
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
            Essayez gratuitement — Sans carte bancaire
          </p>
        </div>

        <div style={{ opacity: ctaProgress, marginTop: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: `linear-gradient(135deg, ${C.violet}, #8B5CF6)`,
              borderRadius: 16,
              padding: "18px 48px",
              boxShadow: `0 8px 30px ${C.violet}50`,
              transform: `scale(${pulseScale})`,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: C.white,
                fontFamily: font,
              }}
            >
              devizly.fr
            </span>
          </div>
          <p
            style={{
              fontSize: 16,
              color: C.muted,
              fontFamily: font,
              marginTop: 16,
            }}
          >
            3 devis gratuits par mois — Upgrade a tout moment
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPOSITION — 90s = 2700 frames @ 30fps
   Cuts rapides avec entrees snappy, zoom sur les screens
   ═══════════════════════════════════════════════════ */
export const DevizlyDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Scene 0: Intro — 3s */}
      <Sequence from={0} durationInFrames={90} premountFor={30}>
        <SceneIntro />
      </Sequence>

      {/* Scene 1: AI Typing — 9s (animation needs time) */}
      <Sequence from={90} durationInFrames={270} premountFor={30}>
        <SceneAITyping />
      </Sequence>

      {/* Scene 2: Dashboard — 6s */}
      <Sequence from={360} durationInFrames={180} premountFor={30}>
        <SceneDashboard />
      </Sequence>

      {/* Scene 3: Devis list — 6s */}
      <Sequence from={540} durationInFrames={180} premountFor={30}>
        <SceneDevisList />
      </Sequence>

      {/* Scene 4: Pipeline — 6s */}
      <Sequence from={720} durationInFrames={180} premountFor={30}>
        <ScenePipeline />
      </Sequence>

      {/* Scene 5: AI form — 6s */}
      <Sequence from={900} durationInFrames={180} premountFor={30}>
        <SceneAIForm />
      </Sequence>

      {/* Scene 6: Client view — 7s */}
      <Sequence from={1080} durationInFrames={210} premountFor={30}>
        <SceneClientView />
      </Sequence>

      {/* Scene 7: Share — 6s */}
      <Sequence from={1290} durationInFrames={180} premountFor={30}>
        <SceneShare />
      </Sequence>

      {/* Scene 8: Clients — 6s */}
      <Sequence from={1470} durationInFrames={180} premountFor={30}>
        <SceneClients />
      </Sequence>

      {/* Scene 9: Stripe — 7s */}
      <Sequence from={1650} durationInFrames={210} premountFor={30}>
        <SceneStripe />
      </Sequence>

      {/* Scene 10: Features recap — 7s */}
      <Sequence from={1860} durationInFrames={210} premountFor={30}>
        <SceneFeatures />
      </Sequence>

      {/* Scene 11: Bold statement — 5s */}
      <Sequence from={2070} durationInFrames={150} premountFor={30}>
        <SceneBold />
      </Sequence>

      {/* Scene 12: CTA — 16s (= 2220 to 2700) */}
      <Sequence from={2220} durationInFrames={480} premountFor={30}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
