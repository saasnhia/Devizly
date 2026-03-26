import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

const C = {
  bgCard: "#0D1117",
  border: "rgba(255,255,255,0.07)",
  violet: "#5B5BD6",
  violetGlow: "rgba(91,91,214,0.15)",
  green: "#00A878",
  white: "#F1F5F9",
  muted: "#64748B",
};

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  delay?: number;
  selected?: boolean;
  accentColor?: string;
  width?: number;
  style?: React.CSSProperties;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  delay = 0,
  selected = false,
  accentColor = C.violet,
  width = 320,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  const y = interpolate(progress, [0, 1], [50, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        width,
        background: C.bgCard,
        border: selected ? `2px solid ${accentColor}` : `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        boxShadow: selected
          ? `0 0 40px ${accentColor}30, 0 0 80px ${accentColor}10`
          : "0 4px 20px rgba(0,0,0,0.3)",
        ...style,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: selected ? accentColor : C.white,
          fontFamily: "Inter, sans-serif",
          marginBottom: subtitle ? 8 : 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 16,
            color: C.muted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
