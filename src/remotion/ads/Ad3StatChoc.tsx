import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { C, FONT, sec } from "../constants";
import { AnimatedText } from "../components/AnimatedText";
import { StatCounter } from "../components/StatCounter";
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  0.0-4.3s  "68% des freelances ne relancent jamais leurs devis non signés."
  4.7-5.8s  "C'est de l'argent perdu."
  6.6-8.9s  "Devizly relance automatiquement tes clients."
  9.7-11.7s "Ne laisse plus passer un seul devis."
*/

/* ── Stat choc (0-5.8s) ── */
function SceneStat() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 30 }}>
      <StatCounter value={68} suffix="%" label="des freelances français" delay={3} color={C.red} fontSize={120} />
      <AnimatedText text="ne relancent JAMAIS leurs devis." fontSize={36} fontWeight={700} delay={20} animation="slideUp" />
      <AnimatedText text="C'est de l'argent perdu." fontSize={32} fontWeight={600} color={C.amber} delay={sec(4.7)} animation="fade" />
    </AbsoluteFill>
  );
}

/* ── Solution (5.8-9s) ── */
function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const features = [
    { icon: "🔔", text: "Relance J+2 auto", delay: 8 },
    { icon: "📧", text: "Email personnalisé", delay: 22 },
    { icon: "📊", text: "Suivi en temps réel", delay: 36 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 24 }}>
      <AnimatedText text="Devizly relance pour vous" fontSize={40} fontWeight={800} delay={3} />
      {features.map((f, i) => {
        const p = spring({ frame: frame - f.delay, fps, config: { damping: 18, mass: 0.6 } });
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 16, padding: "16px 28px",
            background: "rgba(99,102,241,0.08)", borderRadius: 14, border: "1px solid rgba(99,102,241,0.15)",
            opacity: p, transform: `translateX(${interpolate(p, [0, 1], [80, 0])}px)`, width: 650,
          }}>
            <span style={{ fontSize: 32 }}>{f.icon}</span>
            <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.white }}>{f.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── CTA (9-13.7s) ── */
function SceneCTA() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <AnimatedText text="Ne perdez plus de clients." fontSize={44} fontWeight={900} delay={3} />
      <CTAButton text="devizly.fr" subtext="Créez votre 1er devis gratuit" delay={15} />
    </AbsoluteFill>
  );
}

export const Ad3StatChoc: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad3.mp3")} />
      <Sequence from={0} durationInFrames={sec(5.8)}>
        <SceneStat />
      </Sequence>
      <Sequence from={sec(5.8)} durationInFrames={sec(3.9)}>
        <SceneSolution />
      </Sequence>
      <Sequence from={sec(9.7)} durationInFrames={sec(4)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
