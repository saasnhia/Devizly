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
  border: "rgba(255,255,255,0.07)",
  violet: "#5B5BD6",
  green: "#00A878",
  blue: "#3B82F6",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 269;

export const ScenePaiement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left card (Paiement) entrance
  const leftProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  // Right card (Signature) entrance
  const rightProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  // Payment click animation
  const clickFrame = 80;
  const clickProgress = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  // Signature animation
  const signFrame = 100;
  const signProgress = spring({
    frame: frame - signFrame,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  // Badges appear
  const badgeFrame = 160;
  const badgeProgress = spring({
    frame: frame - badgeFrame,
    fps,
    config: { damping: 20, mass: 0.7 },
  });

  // Fade out
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
          top: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: fadeOut,
          /* Shift slightly right to avoid facecam zone */
          paddingLeft: 80,
        }}
      >
        {/* LEFT: Paiement */}
        <div
          style={{
            width: 420,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "36px 32px",
            opacity: leftProgress,
            transform: `translateY(${interpolate(leftProgress, [0, 1], [50, 0])}px)`,
            boxShadow: `0 0 40px ${C.blue}10`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: C.muted,
              fontFamily,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            {"\uD83D\uDCB3"} Paiement en ligne
          </div>

          {/* Pay button */}
          <div
            style={{
              background: frame > clickFrame ? C.green : C.blue,
              borderRadius: 14,
              padding: "18px 0",
              textAlign: "center",
              transform: `scale(${frame > clickFrame && frame < clickFrame + 10 ? 0.95 : 1})`,
              boxShadow: frame > clickFrame
                ? `0 0 30px ${C.green}40`
                : `0 0 30px ${C.blue}30`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.white,
                fontFamily,
              }}
            >
              {frame > clickFrame ? "\u2713 Paiement recu" : "Payer maintenant"}
            </span>
          </div>

          {/* Amount */}
          {frame > clickFrame + 15 && (
            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 28,
                fontWeight: 800,
                color: C.green,
                fontFamily,
                opacity: interpolate(
                  frame,
                  [clickFrame + 15, clickFrame + 30],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              1 500 {"\u20AC"} {"\u2713"}
            </div>
          )}

          {/* Stripe Connect badge */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: badgeProgress,
            }}
          >
            <div
              style={{
                background: `${C.blue}20`,
                border: `1px solid ${C.blue}40`,
                borderRadius: 20,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: C.blue,
                fontFamily,
              }}
            >
              Stripe Connect
            </div>
          </div>
        </div>

        {/* RIGHT: Signature */}
        <div
          style={{
            width: 420,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "36px 32px",
            opacity: rightProgress,
            transform: `translateY(${interpolate(rightProgress, [0, 1], [50, 0])}px)`,
            boxShadow: `0 0 40px ${C.violet}10`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: C.muted,
              fontFamily,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            {"\u270D\uFE0F"} Signature electronique
          </div>

          {/* Signature area */}
          <div
            style={{
              background: "#0A0E17",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {frame <= signFrame ? (
              <span style={{ fontSize: 16, color: C.muted, fontFamily }}>
                Signer ici...
              </span>
            ) : (
              <div
                style={{
                  opacity: signProgress,
                  transform: `scale(${interpolate(signProgress, [0, 1], [0.5, 1])})`,
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    fontStyle: "italic",
                    color: C.violet,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Jean Dupont
                </span>
              </div>
            )}
          </div>

          {/* Signed badge */}
          {frame > signFrame + 20 && (
            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                opacity: interpolate(
                  frame,
                  [signFrame + 20, signFrame + 35],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: `${C.green}15`,
                  border: `2px solid ${C.green}`,
                  borderRadius: 12,
                  padding: "12px 24px",
                }}
              >
                <span style={{ fontSize: 24 }}>{"\u2713"}</span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.green,
                    fontFamily,
                  }}
                >
                  Signe eIDAS
                </span>
              </div>
            </div>
          )}

          {/* eIDAS badge */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: badgeProgress,
            }}
          >
            <div
              style={{
                background: `${C.violet}20`,
                border: `1px solid ${C.violet}40`,
                borderRadius: 20,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: C.violet,
                fontFamily,
              }}
            >
              Conforme eIDAS
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
