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
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  0.0-1.8s  "Devis IA en deux minutes."
  2.5-3.8s  "Signature électronique."
  4.5-5.5s  "Paiement Stripe."
  6.0-7.3s  "Relances automatiques."
  7.9-9.6s  "Tout ça pour 19€/mois."
  10.3-13.7s "Crée ton compte gratuit maintenant sur devizly.fr."
*/

/* ── Feature parade (0-7.3s) ── */
function SceneFeatures() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const features = [
    { icon: "🤖", text: "Devis IA en 2 min", at: 0 },
    { icon: "✍️", text: "Signature électronique", at: sec(2.5) },
    { icon: "💳", text: "Paiement Stripe", at: sec(4.5) },
    { icon: "🔔", text: "Relances automatiques", at: sec(6) },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 22 }}>
      {features.map((f, i) => {
        const p = spring({ frame: frame - f.at, fps, config: { damping: 14, mass: 0.6 } });
        const scale = interpolate(p, [0, 1], [0.5, 1]);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 18, padding: "20px 32px", width: 700,
            background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
            opacity: p, transform: `scale(${scale})`,
          }}>
            <span style={{ fontSize: 40 }}>{f.icon}</span>
            <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.white }}>{f.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── Price reveal (7.3-10.3s) ── */
function ScenePrice() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AnimatedText text="Tout ça pour" fontSize={36} color={C.muted} delay={3} animation="fade" />
      <AnimatedText text="19€/mois" fontSize={90} fontWeight={900} color={C.green} delay={10} animation="spring" />
    </AbsoluteFill>
  );
}

/* ── Final CTA (10.3-15.7s) ── */
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = spring({ frame: frame - 3, fps, config: { damping: 12, mass: 0.6 } });
  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(99,102,241,${glowPulse}) 0%, transparent 70%)`, top: "30%",
      }} />
      <div style={{
        width: 110, height: 110, background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`,
        borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 52, color: C.white, fontWeight: 900, fontFamily: FONT,
        transform: `scale(${logoP})`, opacity: logoP, boxShadow: "0 25px 60px rgba(99,102,241,0.5)", zIndex: 1,
      }}>D</div>
      <AnimatedText text="Devizly" fontSize={68} fontWeight={900} delay={8} />
      <CTAButton text="devizly.fr" delay={18} />
      <AnimatedText text="Gratuit · Sans CB · Made in France 🇫🇷" fontSize={20} color={C.mutedDark} delay={28} animation="fade" />
    </AbsoluteFill>
  );
}

export const Ad7CTA: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad7.mp3")} />
      <Sequence from={0} durationInFrames={sec(7.3)}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={sec(7.3)} durationInFrames={sec(3)}>
        <ScenePrice />
      </Sequence>
      <Sequence from={sec(10.3)} durationInFrames={sec(5.4)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
