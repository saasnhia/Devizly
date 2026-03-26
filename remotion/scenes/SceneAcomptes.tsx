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
  gold: "#F59E0B",
  white: "#F1F5F9",
  muted: "#64748B",
};

const TOTAL_FRAMES = 117;

const OPTIONS = [
  { label: "Acompte 30%", amount: "450 \u20AC", icon: "\uD83D\uDCCA" },
  { label: "Acompte 50%", amount: "750 \u20AC", icon: "\uD83D\uDCC8" },
  { label: "Paiement total", amount: "1 500 \u20AC", icon: "\uD83D\uDCB0" },
];

export const SceneAcomptes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cards entrance stagger
  const selectedFrame = 50;

  // Selected confirmation
  const confirmProgress = spring({
    frame: frame - selectedFrame,
    fps,
    config: { damping: 15, mass: 0.6 },
  });

  // Subtitle
  const subtitleProgress = spring({
    frame: frame - selectedFrame - 20,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  // Fade out
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - 15, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          opacity: fadeOut,
          /* Offset right for facecam */
          paddingLeft: 60,
        }}
      >
        {/* Cards row */}
        <div style={{ display: "flex", gap: 24 }}>
          {OPTIONS.map((opt, i) => {
            const cardP = spring({
              frame: frame - (5 + i * 10),
              fps,
              config: { damping: 18, mass: 0.7 },
            });

            const isSelected = i === 0 && frame >= selectedFrame;
            const selectScale =
              isSelected
                ? interpolate(confirmProgress, [0, 1], [1, 1.05])
                : frame >= selectedFrame
                  ? 0.95
                  : 1;
            const selectOpacity = frame >= selectedFrame && i !== 0 ? 0.4 : 1;

            return (
              <div
                key={opt.label}
                style={{
                  width: 260,
                  background: C.bgCard,
                  border: isSelected
                    ? `2px solid ${C.green}`
                    : `1px solid ${C.border}`,
                  borderRadius: 18,
                  padding: "28px 22px",
                  textAlign: "center",
                  opacity: cardP * selectOpacity,
                  transform: `translateY(${interpolate(cardP, [0, 1], [40, 0])}px) scale(${selectScale})`,
                  boxShadow: isSelected
                    ? `0 0 40px ${C.green}25`
                    : "none",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {opt.icon}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isSelected ? C.green : C.white,
                    fontFamily,
                    marginBottom: 8,
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: C.muted,
                    fontFamily,
                    fontWeight: 500,
                  }}
                >
                  {opt.amount}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation message */}
        {frame >= selectedFrame + 10 && (
          <div
            style={{
              opacity: confirmProgress,
              transform: `scale(${interpolate(confirmProgress, [0, 1], [0.85, 1])})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: C.green,
                fontFamily,
                marginBottom: 8,
              }}
            >
              {"\u2713"} 450{"\u20AC"} recus sur 1 500{"\u20AC"}
            </div>
          </div>
        )}

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: C.muted,
            fontFamily,
            opacity: subtitleProgress,
          }}
        >
          Vous choisissez les conditions
        </div>
      </div>
    </AbsoluteFill>
  );
};
