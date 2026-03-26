import { AbsoluteFill, Sequence } from "remotion";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneTransition } from "./scenes/SceneTransition";
import { SceneSolution } from "./scenes/SceneSolution";
import { SceneDemo } from "./scenes/SceneDemo";
import { ScenePaiement } from "./scenes/ScenePaiement";
import { SceneAcomptes } from "./scenes/SceneAcomptes";
import { SceneCTA } from "./scenes/SceneCTA";

/*
 * DevizlyBackground — Fond anime synchronise avec la video facecam TikTok.
 *
 * Duree totale : 71.9s = 2157 frames @ 30fps
 * Zone reservee facecam : bas-gauche 400x300px (aucun texte)
 *
 * Scenes synchronisees avec la transcription Whisper :
 *   SceneIntro      → 0-259     (0s - 8.66s)    Accroche entrepreneurs
 *   SceneProblem    → 259-624   (8.66s - 20.80s) Problemes devis
 *   SceneTransition → 624-753   (20.80s - 25.10s) Logiciel actuel limité
 *   SceneSolution   → 753-1164  (25.10s - 38.82s) Devizly + IA
 *   SceneDemo       → 1164-1548 (38.82s - 51.60s) Demo flow rapide
 *   ScenePaiement   → 1548-1817 (51.60s - 60.58s) Paiement + Signature
 *   SceneAcomptes   → 1817-1934 (60.58s - 64.48s) Options acomptes
 *   SceneCTA        → 1934-2157 (64.48s - 71.90s) CTA devizly.fr
 */

const SCENES = [
  { from: 0, duration: 259, Component: SceneIntro },
  { from: 259, duration: 365, Component: SceneProblem },
  { from: 624, duration: 129, Component: SceneTransition },
  { from: 753, duration: 411, Component: SceneSolution },
  { from: 1164, duration: 384, Component: SceneDemo },
  { from: 1548, duration: 269, Component: ScenePaiement },
  { from: 1817, duration: 117, Component: SceneAcomptes },
  { from: 1934, duration: 223, Component: SceneCTA },
] as const;

export const DevizlyBackground: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#050509" }}>
      {/* Facecam safe-zone indicator (not rendered in final — debug only) */}
      {/* <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: 400, height: 300, border: "2px dashed rgba(255,0,0,0.3)",
        zIndex: 999,
      }} /> */}

      {SCENES.map(({ from, duration, Component }) => (
        <Sequence key={from} from={from} durationInFrames={duration}>
          <Component />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
