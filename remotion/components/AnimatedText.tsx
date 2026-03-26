import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = "#F1F5F9",
  fontWeight = 700,
  fontFamily = "Inter, sans-serif",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily,
        transform: `translateY(${y}px)`,
        opacity,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

interface StaggerTextProps {
  lines: string[];
  delayBetween?: number;
  startDelay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  fontFamily?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
}

export const StaggerText: React.FC<StaggerTextProps> = ({
  lines,
  delayBetween = 20,
  startDelay = 0,
  fontSize = 48,
  color = "#F1F5F9",
  fontWeight = 700,
  fontFamily = "Inter, sans-serif",
  lineHeight = 1.4,
  style,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {lines.map((line, i) => (
        <AnimatedText
          key={line}
          text={line}
          delay={startDelay + i * delayBetween}
          fontSize={fontSize}
          color={color}
          fontWeight={fontWeight}
          fontFamily={fontFamily}
          style={{ lineHeight }}
        />
      ))}
    </div>
  );
};
