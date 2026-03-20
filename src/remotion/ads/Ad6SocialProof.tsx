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
  0.0-2.8s  "Marc, artisan électricien à Lyon."
  3.5-7.2s  "Avant Devizly : il perdait des clients faute de devis rapides."
  7.9-12.0s "Après : son taux de signature a augmenté de 20% en 3 mois."
  12.7-14.7s "Devizly, c'est son secret."
*/

/* ── Intro Marc (0-2.8s) ── */
function SceneIntro() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 20 }}>
      <div style={{ fontSize: 80, marginBottom: 8 }}>👷</div>
      <AnimatedText text="Marc, artisan électricien" fontSize={44} fontWeight={800} delay={3} animation="slideUp" />
      <AnimatedText text="Lyon, France" fontSize={28} color={C.muted} delay={12} animation="fade" />
    </AbsoluteFill>
  );
}

/* ── Avant (2.8-7.2s) ── */
function SceneAvant() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { text: "Devis sur papier", delay: 8 },
    { text: "Pas de suivi", delay: 22 },
    { text: "Clients perdus", delay: 38 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 20 }}>
      <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.red, letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 12 }}>Avant Devizly</div>
      {items.map((item, i) => {
        const p = spring({ frame: frame - item.delay, fps, config: { damping: 18, mass: 0.7 } });
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 28px",
            background: "rgba(239,68,68,0.08)", borderRadius: 14, width: 650, opacity: p,
            transform: `translateY(${interpolate(p, [0, 1], [25, 0])}px)`,
          }}>
            <span style={{ fontSize: 22 }}>❌</span>
            <span style={{ fontFamily: FONT, fontSize: 26, color: C.white }}>{item.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── Après + stats (7.2-12.7s) ── */
function SceneApres() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.green, letterSpacing: 3, textTransform: "uppercase" as const }}>Après Devizly</div>
      <StatCounter value={20} suffix="%" label="de CA en plus" delay={10} color={C.green} />
      <StatCounter value={148} suffix="%" label="plus de devis signés" delay={30} color={C.violet} fontSize={60} />
    </AbsoluteFill>
  );
}

/* ── CTA (12.7-16.7s) ── */
function SceneCTA() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <AnimatedText text="Devizly, c'est son secret." fontSize={44} fontWeight={900} delay={3} />
      <AnimatedText text="Et le vôtre ?" fontSize={44} fontWeight={900} color={C.green} delay={12} animation="spring" />
      <CTAButton text="devizly.fr" subtext="Gratuit pour démarrer" delay={22} />
    </AbsoluteFill>
  );
}

export const Ad6SocialProof: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad6.mp3")} />
      <Sequence from={0} durationInFrames={sec(2.8)}>
        <SceneIntro />
      </Sequence>
      <Sequence from={sec(2.8)} durationInFrames={sec(4.4)}>
        <SceneAvant />
      </Sequence>
      <Sequence from={sec(7.2)} durationInFrames={sec(5.5)}>
        <SceneApres />
      </Sequence>
      <Sequence from={sec(12.7)} durationInFrames={sec(4)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
