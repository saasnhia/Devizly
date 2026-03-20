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
import { ScreenshotReveal } from "../components/ScreenshotReveal";
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  0.0-4.1s  "Avant : Word, Excel, copier-coller, reformater..."
  4.5-7.7s  "Après Devizly : un devis professionnel en deux clics."
  7.9-9.7s  "Signature électronique intégrée."
  9.9-11.4s "Paiement Stripe direct."
  11.7-13.9s "Tes clients adorent, toi aussi."
*/

/* ── Avant (0-4.5s) ── */
function SceneAvant() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chaos = [
    { text: "📄 Word v3_final_FINAL.docx", delay: 5 },
    { text: "🧮 Excel formule cassée #REF!", delay: 18 },
    { text: "📋 Copier-coller…", delay: 32 },
    { text: "🔄 Reformater…", delay: 46 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 20 }}>
      <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.red, letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 12 }}>AVANT</div>
      {chaos.map((item, i) => {
        const p = spring({ frame: frame - item.delay, fps, config: { damping: 18, mass: 0.6 } });
        return (
          <div key={i} style={{
            fontFamily: FONT, fontSize: 28, color: C.white, opacity: p,
            transform: `translateX(${interpolate(p, [0, 1], [-120, 0])}px)`,
            padding: "14px 28px", background: "rgba(239,68,68,0.1)", borderRadius: 14,
            border: "1px solid rgba(239,68,68,0.2)", width: "100%", maxWidth: 750,
          }}>{item.text}</div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── Après (4.5-9.7s) ── */
function SceneApres() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const features = [
    { text: "✅ Devis pro en 2 clics", delay: 5 },
    { text: "✅ Signature électronique", delay: 30 },
    { text: "✅ Paiement Stripe direct", delay: 50 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 20 }}>
      <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.green, letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 12 }}>APRÈS DEVIZLY</div>
      {features.map((item, i) => {
        const p = spring({ frame: frame - item.delay, fps, config: { damping: 18, mass: 0.6 } });
        return (
          <div key={i} style={{
            fontFamily: FONT, fontSize: 28, color: C.white, opacity: p,
            transform: `translateX(${interpolate(p, [0, 1], [120, 0])}px)`,
            padding: "14px 28px", background: "rgba(34,197,94,0.08)", borderRadius: 14,
            border: "1px solid rgba(34,197,94,0.2)", width: "100%", maxWidth: 750,
          }}>{item.text}</div>
        );
      })}
      <ScreenshotReveal delay={60} scale={0.7} />
    </AbsoluteFill>
  );
}

/* ── CTA (11.7-15.9s) ── */
function SceneCTA() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <AnimatedText text="Tes clients adorent." fontSize={48} fontWeight={900} delay={3} />
      <AnimatedText text="Toi aussi." fontSize={48} fontWeight={900} color={C.green} delay={12} animation="spring" />
      <CTAButton text="devizly.fr" subtext="Essai gratuit — sans CB" delay={22} />
    </AbsoluteFill>
  );
}

export const Ad2BeforeAfter: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad2.mp3")} />
      <Sequence from={0} durationInFrames={sec(4.5)}>
        <SceneAvant />
      </Sequence>
      <Sequence from={sec(4.5)} durationInFrames={sec(7.2)}>
        <SceneApres />
      </Sequence>
      <Sequence from={sec(11.7)} durationInFrames={sec(4.2)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
