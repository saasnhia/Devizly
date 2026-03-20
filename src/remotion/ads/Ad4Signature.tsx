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
import { PhoneMockup } from "../components/PhoneMockup";
import { CTAButton } from "../components/CTAButton";

loadFont();

/*
  0.0-1.5s  "Ton client reçoit un lien."
  1.9-3.1s  "Il ouvre son téléphone."
  3.4-4.5s  "Il lit ton devis."
  5.0-6.4s  "Il signe en dix secondes."
  7.1-8.1s  "C'est ça, Devizly."
  8.7-11.3s "La signature électronique la plus simple du marché."
*/

/* ── Steps flow (0-6.4s) ── */
function SceneFlow() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = [
    { icon: "📤", label: "Reçoit un lien", at: 0 },
    { icon: "📱", label: "Ouvre son téléphone", at: sec(1.9) },
    { icon: "👀", label: "Lit ton devis", at: sec(3.4) },
    { icon: "✍️", label: "Signe en 10 secondes", at: sec(5) },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
      <AnimatedText text="Ton client :" fontSize={34} color={C.muted} delay={0} animation="fade" style={{ marginBottom: 16 }} />
      {steps.map((s, i) => {
        const p = spring({ frame: frame - s.at, fps, config: { damping: 16, mass: 0.7 } });
        const isLast = i === steps.length - 1;
        return (
          <React.Fragment key={i}>
            <div style={{
              display: "flex", alignItems: "center", gap: 18, padding: "16px 28px", width: 650,
              background: isLast ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
              borderRadius: 14, border: isLast ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)",
              opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
            }}>
              <span style={{ fontSize: 36 }}>{s.icon}</span>
              <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: isLast ? C.green : C.white }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 2, height: 14, background: C.violet, opacity: p }} />}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
}

/* ── Phone mockup (6.4-8.5s) ── */
function ScenePhone() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sigProgress = spring({ frame: frame - 25, fps, config: { damping: 20, mass: 1 } });

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <PhoneMockup delay={3} scale={1.1}>
        <div style={{ padding: "20px 8px" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Devis DEV-0042</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.bg, marginBottom: 12 }}>Création site web</div>
          <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: C.mutedDark }}>Total TTC</span>
              <span style={{ fontWeight: 700, color: C.bg }}>4 150 €</span>
            </div>
          </div>
          <div style={{
            border: `2px dashed ${C.violet}`, borderRadius: 12, padding: 16,
            textAlign: "center" as const, height: 100, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {sigProgress > 0.5 ? (
              <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 36, color: C.bg, opacity: sigProgress, transform: `scale(${sigProgress})` }}>Marie Martin</div>
            ) : (
              <span style={{ fontSize: 12, color: C.muted }}>Signez ici ✍️</span>
            )}
          </div>
          <div style={{
            marginTop: 12, background: C.green, borderRadius: 10, padding: "12px 0",
            textAlign: "center" as const, fontSize: 14, fontWeight: 700, color: C.white,
            opacity: interpolate(sigProgress, [0.8, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>✅ Signer et accepter</div>
        </div>
      </PhoneMockup>
    </AbsoluteFill>
  );
}

/* ── CTA (8.5-13.3s) ── */
function SceneCTA() {
  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <AnimatedText text="La signature la plus simple" fontSize={42} fontWeight={800} delay={3} />
      <AnimatedText text="du marché." fontSize={42} fontWeight={800} color={C.green} delay={10} animation="spring" />
      <CTAButton text="devizly.fr" subtext="Signature incluse — gratuit" delay={20} />
    </AbsoluteFill>
  );
}

export const Ad4Signature: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile("ads/voiceovers/ad4.mp3")} />
      <Sequence from={0} durationInFrames={sec(6.4)}>
        <SceneFlow />
      </Sequence>
      <Sequence from={sec(6.4)} durationInFrames={sec(2.3)}>
        <ScenePhone />
      </Sequence>
      <Sequence from={sec(8.7)} durationInFrames={sec(4.6)}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
