import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { C, FONT, sec } from "../constants";
import { AnimatedText } from "../components/AnimatedText";
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  Voice timeline:
  0.0-3.1s  "Tu perds 4h par semaine à faire tes devis manuellement..."
  3.5-6.2s  "Copier-coller, mise en forme, PDF..."
  6.6-7.4s  "C'est terminé."
  8.1-12.5s "Avec Devizly, l'IA génère ton devis complet en 2 minutes."
  13.2-15.8s "Essaie gratuitement sur devizly point fr."
*/

/* ── Hook (0-3.5s) ── */
function SceneHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = frame < 15 ? Math.sin(frame * 2) * 3 : 0;
  const emojiProgress = spring({ frame: frame - 20, fps, config: { damping: 10, mass: 0.5 } });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        transform: `translateX(${shake}px)`,
      }}
    >
      <AnimatedText text="Tu perds 4h par semaine" fontSize={58} fontWeight={900} delay={3} animation="slideUp" />
      <AnimatedText text="à faire des devis manuellement." fontSize={48} fontWeight={700} color={C.red} delay={12} animation="slideUp" />
      <div style={{ fontSize: 120, marginTop: 30, transform: `scale(${emojiProgress})`, opacity: emojiProgress }}>🤯</div>
    </AbsoluteFill>
  );
}

/* ── Pain points (3.5-7.4s) ── */
function ScenePain() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const points = [
    { text: "📋 Copier-coller...", delay: 3 },
    { text: "🎨 Mise en forme...", delay: 18 },
    { text: "📄 PDF...", delay: 33 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 24 }}>
      {points.map((p, i) => {
        const progress = spring({ frame: frame - p.delay, fps, config: { damping: 18, mass: 0.6 } });
        return (
          <div key={i} style={{
            fontFamily: FONT, fontSize: 36, color: C.white, opacity: progress,
            transform: `translateX(${interpolate(progress, [0, 1], [-150, 0])}px)`,
            padding: "16px 32px", background: "rgba(239,68,68,0.1)", borderRadius: 16,
            border: "1px solid rgba(239,68,68,0.2)", width: "100%", maxWidth: 750,
          }}>{p.text}</div>
        );
      })}
      {/* "C'est terminé" appears at ~3s into this scene (=6.5s global) */}
      <AnimatedText text="C'est terminé." fontSize={52} fontWeight={900} color={C.green} delay={sec(3)} animation="spring" />
    </AbsoluteFill>
  );
}

/* ── Solution / screenshot (7.4-13s) ── */
function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badgeProgress = spring({ frame: frame - 3, fps, config: { damping: 18, mass: 0.8 } });
  const imgProgress = spring({ frame: frame - 30, fps, config: { damping: 22, mass: 1.2 } });
  const imgY = interpolate(imgProgress, [0, 1], [120, 0]);
  const imgRotateX = interpolate(imgProgress, [0, 1], [5, 0]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: 80, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`,
          borderRadius: 40, padding: "10px 28px", fontFamily: FONT, fontSize: 18, fontWeight: 700,
          color: C.white, transform: `scale(${badgeProgress})`, opacity: badgeProgress,
        }}>✨ Avec Devizly</div>
        <AnimatedText text="L'IA génère ton devis en 2 min" fontSize={36} fontWeight={700} delay={10} animation="fade" />
      </div>
      {frame >= 30 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -35%) translateY(${imgY}px) perspective(1200px) rotateX(${imgRotateX}deg)`,
          opacity: imgProgress, width: "85%",
        }}>
          <Img src={staticFile("marketing/devis ads.png")} style={{ width: "100%", objectFit: "contain", borderRadius: 16, boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }} />
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ── CTA (13-17.8s) ── */
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoProgress = spring({ frame: frame - 3, fps, config: { damping: 14, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <div style={{
        width: 100, height: 100, background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`,
        borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 48, color: C.white, fontWeight: 900, fontFamily: FONT,
        transform: `scale(${logoProgress})`, opacity: logoProgress, boxShadow: "0 20px 50px rgba(99,102,241,0.4)",
      }}>D</div>
      <AnimatedText text="Devizly" fontSize={64} fontWeight={900} delay={8} />
      <CTAButton text="Essai gratuit → devizly.fr" subtext="Sans carte bancaire" delay={15} />
    </AbsoluteFill>
  );
}

export const Ad1PainHook: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad1.mp3")} />
      {/* Scenes timed to voice */}
      <Sequence from={0} durationInFrames={sec(3.5)}>
        <SceneHook />
      </Sequence>
      <Sequence from={sec(3.5)} durationInFrames={sec(3.9)}>
        <ScenePain />
      </Sequence>
      <Sequence from={sec(7.4)} durationInFrames={sec(5.8)}>
        <SceneSolution />
      </Sequence>
      <Sequence from={sec(13.2)} durationInFrames={sec(4.6)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
