export const C = {
  bg: "#0F172A",
  bgLight: "#1E293B",
  bgCard: "#1A2332",
  white: "#FFFFFF",
  green: "#22C55E",
  greenDark: "#16A34A",
  violet: "#6366F1",
  violetLight: "#818CF8",
  muted: "#94A3B8",
  mutedDark: "#64748B",
  red: "#EF4444",
  amber: "#F59E0B",
  blue: "#3B82F6",
  cyan: "#06B6D4",
} as const;

export const FONT = "Inter";
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Scene timing helpers (in frames at 30fps)
export const sec = (s: number) => Math.round(s * FPS);
