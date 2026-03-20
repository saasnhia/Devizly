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
import { PriceTag } from "../components/PriceTag";
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  0.0-2.6s  "Freebe : 99€/mois."
  3.3-5.2s  "Sellsy : 120€."
  5.8-7.6s  "Devizly : 19€."
  8.2-9.2s  "Même fonctionnalités."
  9.5-10.6s "Cinq fois moins cher."
  10.8-12.0s "Pourquoi payer plus ?"
*/

/* ── Comparatif (0-7.6s) ── */
function SceneComparatif() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const competitors = [
    { name: "Freebe", price: "99€/mois", at: 3 },
    { name: "Sellsy", price: "120€/mois", at: sec(3.3) },
  ];
  const devizlyAt = sec(5.8);
  const devP = spring({ frame: frame - devizlyAt, fps, config: { damping: 12, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 24 }}>
      {competitors.map((c, i) => {
        const p = spring({ frame: frame - c.at, fps, config: { damping: 18, mass: 0.6 } });
        return (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", width: 700,
            padding: "16px 28px", background: "rgba(239,68,68,0.06)", borderRadius: 14,
            border: "1px solid rgba(239,68,68,0.12)", opacity: p,
            transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 28, color: C.white, fontWeight: 500 }}>{c.name}</span>
            <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: C.red, textDecoration: "line-through" }}>{c.price}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 12, opacity: devP, transform: `scale(${devP})` }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", width: 700,
          padding: "22px 32px", background: "rgba(34,197,94,0.08)", borderRadius: 16,
          border: `2px solid ${C.green}`, boxShadow: "0 10px 30px rgba(34,197,94,0.2)",
        }}>
          <span style={{ fontFamily: FONT, fontSize: 32, color: C.white, fontWeight: 800 }}>Devizly</span>
          <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: C.green }}>19€/mois</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Verdict + CTA (7.6-14s) ── */
function SceneCTA() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AnimatedText text="5× moins cher." fontSize={56} fontWeight={900} color={C.green} delay={3} />
      <AnimatedText text="Pourquoi payer plus ?" fontSize={40} fontWeight={700} color={C.muted} delay={15} animation="fade" />
      <PriceTag price="0€" label="Gratuit" period="" delay={25} />
      <PriceTag price="19€" label="Pro" highlight delay={35} />
      <CTAButton text="devizly.fr" subtext="3 devis/mois offerts" delay={50} />
    </AbsoluteFill>
  );
}

export const Ad5Pricing: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad5.mp3")} />
      <Sequence from={0} durationInFrames={sec(7.6)}>
        <SceneComparatif />
      </Sequence>
      <Sequence from={sec(7.6)} durationInFrames={sec(6.4)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
