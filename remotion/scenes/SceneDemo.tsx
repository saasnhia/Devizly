import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const C = {
  bg: "#050509",
  bgCard: "#0D1117",
  bgRow: "#0F1419",
  border: "rgba(255,255,255,0.07)",
  borderLight: "rgba(255,255,255,0.04)",
  violet: "#5B5BD6",
  violetDim: "rgba(91,91,214,0.12)",
  green: "#00A878",
  greenDim: "rgba(0,168,120,0.12)",
  white: "#F1F5F9",
  muted: "#64748B",
  mutedLight: "#94A3B8",
};

const TOTAL_FRAMES = 384;

const PROMPT_TEXT = "Developpement site web e-commerce React avec Stripe";

const QUOTE_ITEMS = [
  { desc: "Developpement site e-commerce React", qty: "1", unit: "3 500,00 \u20AC", total: "3 500,00 \u20AC" },
  { desc: "Integration paiement Stripe", qty: "1", unit: "800,00 \u20AC", total: "800,00 \u20AC" },
  { desc: "Formation et mise en ligne", qty: "1", unit: "400,00 \u20AC", total: "400,00 \u20AC" },
];

/* ── Devizly logo (matches real SVG) ──────────────────────── */

function DevizlyMiniLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill={C.violet} />
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="white"
        opacity="0.9"
      />
      <path d="M25 18L20 26H24L22 34L29 24H25L27 18Z" fill="#5B5BD6" />
    </svg>
  );
}

/* ── AI typing cursor ─────────────────────────────────────── */

function TypeWriter({ text, startFrame }: { text: string; startFrame: number }) {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visible = Math.min(Math.floor(elapsed * 0.6), text.length);
  const showCursor = elapsed % 16 < 10 && visible < text.length;

  return (
    <span>
      {text.slice(0, visible)}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1.1em",
            background: C.violet,
            marginLeft: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </span>
  );
}

/* ── Main scene ───────────────────────────────────────────── */

export const SceneDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* -- Phase timings -- */
  const PROGRESS_START = 75;
  const PROGRESS_END = 130;
  const DEVIS_START = 140; // devis card replaces prompt

  const progressWidth = interpolate(
    frame,
    [PROGRESS_START, PROGRESS_END],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const progressDone = frame >= PROGRESS_END;
  const showDevis = frame >= DEVIS_START;

  /* -- Window entrance -- */
  const winP = spring({ frame, fps, config: { damping: 20, mass: 0.8 } });
  const winY = interpolate(winP, [0, 1], [50, 0]);

  /* -- Devis element timings (relative to DEVIS_START) -- */
  const d = (offset: number) => frame - DEVIS_START - offset;
  const sp = (offset: number, damping = 20, mass = 0.7) =>
    spring({ frame: d(offset), fps, config: { damping, mass } });

  /* -- Fade out -- */
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 25, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          top: 30,
          left: "50%",
          transform: `translateX(-50%) translateY(${winY}px)`,
          width: 820,
          opacity: fadeOut,
        }}
      >
        {/* ═══ Phase 1: AI generation prompt ═══ */}
        {!showDevis && (
          <div
            style={{
              background: C.bgCard,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
              boxShadow: `0 0 60px ${C.violet}10`,
            }}
          >
            {/* macOS title bar */}
            <div
              style={{
                height: 44,
                background: "#080B11",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                gap: 8,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ marginLeft: 20, fontSize: 13, color: C.muted, fontFamily }}>
                Devizly {"\u2014"} Nouveau devis
              </span>
            </div>

            {/* Prompt area */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{ fontSize: 13, color: C.muted, fontFamily, fontWeight: 600, marginBottom: 10 }}>
                {"\u2728"} Generer avec l&apos;IA
              </div>
              <div
                style={{
                  background: "#0A0E17",
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  fontSize: 18,
                  color: C.white,
                  fontFamily: "monospace",
                  lineHeight: 1.5,
                }}
              >
                <TypeWriter text={PROMPT_TEXT} startFrame={10} />
              </div>
            </div>

            {/* Progress bar */}
            {frame >= PROGRESS_START - 5 && (
              <div style={{ padding: "0 28px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: C.muted, fontFamily }}>
                    {progressDone ? "\u2713 Devis genere !" : "Generation IA..."}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: progressDone ? C.green : C.violet,
                      fontFamily,
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(progressWidth)}%
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                  <div
                    style={{
                      width: `${progressWidth}%`,
                      height: "100%",
                      borderRadius: 2,
                      background: progressDone ? C.green : C.violet,
                      boxShadow: `0 0 12px ${progressDone ? C.green : C.violet}60`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Phase 2: Realistic Devizly devis ═══ */}
        {showDevis && (
          <div
            style={{
              background: C.bgCard,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
              boxShadow: `0 4px 60px rgba(0,0,0,0.5), 0 0 80px ${C.violet}08`,
            }}
          >
            {/* ── Violet header band ── */}
            <div
              style={{
                background: `linear-gradient(135deg, ${C.violet}, #4A4AC4)`,
                padding: "22px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: sp(0),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <DevizlyMiniLogo size={32} />
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" as const }}>
                    Devis
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", fontFamily, letterSpacing: -0.5 }}>
                    DEV-2026-0047
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily }}>
                  24 mars 2026
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily }}>
                  Valable 30 jours
                </div>
              </div>
            </div>

            {/* ── Client info ── */}
            <div
              style={{
                margin: "16px 20px 0",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10,
                border: `1px solid ${C.borderLight}`,
                display: "flex",
                gap: 24,
                opacity: sp(8),
                transform: `translateY(${interpolate(sp(8), [0, 1], [10, 0])}px)`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6 }}>
                  Client
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily }}>
                  Martin Leblanc
                </div>
                <div style={{ fontSize: 13, color: C.mutedLight, fontFamily, marginTop: 2 }}>
                  Agence Pixel Studio
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: C.muted, fontFamily }}>
                  martin@pixel-studio.fr
                </div>
              </div>
            </div>

            {/* ── Items table ── */}
            <div style={{ padding: "16px 20px 0" }}>
              {/* Table header */}
              <div
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  background: `${C.violet}18`,
                  borderRadius: "8px 8px 0 0",
                  border: `1px solid ${C.violet}20`,
                  borderBottom: "none",
                  opacity: sp(18),
                }}
              >
                <div style={{ flex: 5, fontSize: 11, fontWeight: 700, color: C.violet, fontFamily, textTransform: "uppercase" as const, letterSpacing: 1 }}>
                  Description
                </div>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: C.violet, fontFamily, textTransform: "uppercase" as const, letterSpacing: 1, textAlign: "center" as const }}>
                  Qte
                </div>
                <div style={{ flex: 2, fontSize: 11, fontWeight: 700, color: C.violet, fontFamily, textTransform: "uppercase" as const, letterSpacing: 1, textAlign: "right" as const }}>
                  Prix unit.
                </div>
                <div style={{ flex: 2, fontSize: 11, fontWeight: 700, color: C.violet, fontFamily, textTransform: "uppercase" as const, letterSpacing: 1, textAlign: "right" as const }}>
                  Total
                </div>
              </div>

              {/* Table rows */}
              {QUOTE_ITEMS.map((item, i) => {
                const lineP = sp(28 + i * 14);
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={item.desc}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 14px",
                      background: isEven ? C.bgRow : "transparent",
                      borderLeft: `1px solid ${C.borderLight}`,
                      borderRight: `1px solid ${C.borderLight}`,
                      borderBottom: `1px solid ${C.borderLight}`,
                      opacity: lineP,
                      transform: `translateY(${interpolate(lineP, [0, 1], [12, 0])}px)`,
                    }}
                  >
                    <div style={{ flex: 5, fontSize: 15, color: C.white, fontFamily, fontWeight: 500 }}>
                      {item.desc}
                    </div>
                    <div style={{ flex: 1, fontSize: 14, color: C.mutedLight, fontFamily, textAlign: "center" as const }}>
                      {item.qty}
                    </div>
                    <div style={{ flex: 2, fontSize: 14, color: C.mutedLight, fontFamily, textAlign: "right" as const }}>
                      {item.unit}
                    </div>
                    <div style={{ flex: 2, fontSize: 15, color: C.white, fontFamily, fontWeight: 600, textAlign: "right" as const }}>
                      {item.total}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Totals section ── */}
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "flex-end",
                opacity: sp(75),
                transform: `translateY(${interpolate(sp(75), [0, 1], [10, 0])}px)`,
              }}
            >
              <div style={{ width: 280 }}>
                {/* Sous-total HT */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontSize: 14, color: C.muted, fontFamily }}>Sous-total HT</span>
                  <span style={{ fontSize: 14, color: C.mutedLight, fontFamily, fontWeight: 500 }}>4 700,00 {"\u20AC"}</span>
                </div>
                {/* TVA */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontSize: 14, color: C.muted, fontFamily }}>TVA 20%</span>
                  <span style={{ fontSize: 14, color: C.mutedLight, fontFamily, fontWeight: 500 }}>940,00 {"\u20AC"}</span>
                </div>
                {/* Separator */}
                <div style={{ height: 2, background: C.violet, borderRadius: 1, margin: "8px 0", opacity: 0.4 }} />
                {/* Total TTC */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", alignItems: "center" }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: C.white, fontFamily }}>Total TTC</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: C.white, fontFamily, letterSpacing: -0.5 }}>5 640,00 {"\u20AC"}</span>
                </div>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div
              style={{
                padding: "4px 20px 20px",
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}
            >
              {/* Signer le devis */}
              <div
                style={{
                  flex: 1,
                  background: C.green,
                  borderRadius: 12,
                  padding: "16px 0",
                  textAlign: "center" as const,
                  opacity: sp(100),
                  transform: `translateY(${interpolate(sp(100), [0, 1], [15, 0])}px)`,
                  boxShadow: `0 0 30px ${C.green}30`,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily }}>
                  {"\u270D\uFE0F"} Signer le devis
                </span>
              </div>
              {/* Payer l'acompte */}
              <div
                style={{
                  flex: 1,
                  background: C.violet,
                  borderRadius: 12,
                  padding: "16px 0",
                  textAlign: "center" as const,
                  opacity: sp(112),
                  transform: `translateY(${interpolate(sp(112), [0, 1], [15, 0])}px)`,
                  boxShadow: `0 0 30px ${C.violet}30`,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily }}>
                  {"\uD83D\uDCB3"} Acompte 30% {"\u2014"} 1 692 {"\u20AC"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Badge: "Genere par IA en 10 secondes" ═══ */}
        {showDevis && (
          <div
            style={{
              marginTop: 22,
              textAlign: "center" as const,
              opacity: sp(135),
              transform: `scale(${interpolate(sp(135, 15, 0.6), [0, 1], [0.8, 1])})`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: `${C.green}15`,
                border: `1px solid ${C.green}35`,
                borderRadius: 30,
                padding: "10px 28px",
              }}
            >
              <span style={{ fontSize: 18 }}>{"\u2728"}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: C.green, fontFamily }}>
                Genere par IA Devizly en 10 secondes {"\u2713"}
              </span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
