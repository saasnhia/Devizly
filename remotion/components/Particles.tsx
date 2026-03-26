import { useCurrentFrame, interpolate } from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  phase: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateParticles(count: number, seed: number): Particle[] {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: rng() * 1920,
    y: rng() * 1080,
    size: 2 + rng() * 4,
    speed: 0.3 + rng() * 0.7,
    opacity: 0.15 + rng() * 0.35,
    phase: rng() * Math.PI * 2,
  }));
}

interface ParticlesProps {
  color?: string;
  count?: number;
  seed?: number;
  fadeIn?: number;
  fadeOut?: number;
  totalFrames?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  color = "rgba(91,91,214,0.5)",
  count = 30,
  seed = 42,
  fadeIn = 20,
  fadeOut = 0,
  totalFrames = 300,
}) => {
  const frame = useCurrentFrame();
  const particles = generateParticles(count, seed);

  const globalOpacity = interpolate(
    frame,
    [0, fadeIn, totalFrames - (fadeOut || 20), totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {particles.map((p, i) => {
        const drift = Math.sin(frame * 0.02 * p.speed + p.phase) * 30;
        const rise = (frame * 0.3 * p.speed) % 1080;
        const y = (p.y - rise + 1080) % 1080;
        const x = p.x + drift;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: color,
              opacity: p.opacity,
              filter: `blur(${p.size > 4 ? 1 : 0}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

interface ConvergingParticlesProps {
  targetX: number;
  targetY: number;
  color?: string;
  count?: number;
  seed?: number;
  startFrame?: number;
}

export const ConvergingParticles: React.FC<ConvergingParticlesProps> = ({
  targetX,
  targetY,
  color = "rgba(91,91,214,0.6)",
  count = 40,
  seed = 99,
  startFrame = 30,
}) => {
  const frame = useCurrentFrame();
  const particles = generateParticles(count, seed);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const delay = i * 1.5;
        const elapsed = Math.max(0, frame - startFrame - delay);
        const progress = Math.min(elapsed / 60, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const x = p.x + (targetX - p.x) * eased;
        const y = p.y + (targetY - p.y) * eased;
        const opacity = progress < 1 ? p.opacity : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: color,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
