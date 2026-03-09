import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

/* ═══════════════════════════════════════════════════════════
   CAMERA RIG — Dolly + orbital, driven by useCurrentFrame
   ═══════════════════════════════════════════════════════════ */

function CameraRig({ frame, fps }: { frame: number; fps: number }) {
  const { camera } = useThree();

  // Dolly: z from 6 → 3.5 (closer for larger MacBook)
  const dolly = interpolate(frame, [0, 150], [6, 3.5], {
    extrapolateRight: "clamp",
  });

  // Subtle X orbit
  const orbitX = interpolate(frame, [0, 100, 200, 300], [1.5, 2.0, 1.2, 1.8], {
    extrapolateRight: "clamp",
  });

  // Y stays fairly constant with subtle movement
  const camY = interpolate(frame, [0, 150, 300], [3.2, 2.8, 3.5], {
    extrapolateRight: "clamp",
  });

  // Scale-down shift for features phase
  const _fps = fps; // acknowledge param
  void _fps;

  camera.position.set(orbitX, camY, dolly);
  camera.lookAt(0, 0.6, 0);

  return null;
}

/* ═══════════════════════════════════════════════════════════
   MACBOOK 3D MESH
   ═══════════════════════════════════════════════════════════ */

function MacBookMesh({
  frame,
  fps,
  macbookOpacity,
}: {
  frame: number;
  fps: number;
  macbookOpacity: number;
}) {
  // Load both screen textures
  const [dashboardTex, devisTex] = useLoader(THREE.TextureLoader, [
    staticFile("marketing/final dashboard.png"),
    staticFile("marketing/devis client.png"),
  ]);

  // Entry from bottom (spring)
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
  });
  const posY = interpolate(entryProgress, [0, 1], [-3, 0]);

  // Rotation: slow orbital Y
  const rotY = interpolate(frame, [0, 80, 160, 300], [0.4, 0.15, -0.1, 0.2], {
    extrapolateRight: "clamp",
  });

  // Shift right during features phase (no scale-down)
  const shiftX = interpolate(frame, [150, 185], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shift up slightly during features
  const shiftY = interpolate(frame, [150, 185], [0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Crossfade: dashboard → devis client (frames 80–110)
  const dashScreenOpacity =
    interpolate(frame, [80, 110], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * macbookOpacity;
  const devisScreenOpacity =
    interpolate(frame, [80, 110], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * macbookOpacity;

  return (
    <group
      position={[shiftX, posY + shiftY, 0]}
      rotation={[-0.25, rotY, 0]}
      scale={1.4}
    >
      {/* ── Base (keyboard) ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.6, 0.06, 2.4]} />
        <meshStandardMaterial
          color="#a0a0a0"
          metalness={0.92}
          roughness={0.12}
          transparent
          opacity={macbookOpacity}
        />
      </mesh>

      {/* ── Trackpad depression ── */}
      <mesh position={[0, 0.031, 0.4]}>
        <boxGeometry args={[1.6, 0.002, 1.0]} />
        <meshStandardMaterial
          color="#909090"
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={macbookOpacity}
        />
      </mesh>

      {/* ── Screen hinge group ── */}
      <group position={[0, 0.03, -1.2]} rotation={[-0.18, 0, 0]}>
        {/* Screen back panel (lid) */}
        <mesh position={[0, 1.15, -0.015]}>
          <boxGeometry args={[3.6, 2.3, 0.025]} />
          <meshStandardMaterial
            color="#a0a0a0"
            metalness={0.92}
            roughness={0.12}
            transparent
            opacity={macbookOpacity}
          />
        </mesh>

        {/* Black bezel frame */}
        <mesh position={[0, 1.15, 0.0]}>
          <boxGeometry args={[3.3, 2.1, 0.005]} />
          <meshStandardMaterial
            color="#111111"
            transparent
            opacity={macbookOpacity}
          />
        </mesh>

        {/* Screen display — dashboard (fades out frames 80–110) */}
        <mesh position={[0, 1.15, 0.004]}>
          <planeGeometry args={[3.1, 1.95]} />
          <meshStandardMaterial
            map={dashboardTex}
            emissiveMap={dashboardTex}
            emissiveIntensity={0.6}
            transparent
            opacity={dashScreenOpacity}
          />
        </mesh>

        {/* Screen display — devis client (fades in frames 80–110) */}
        <mesh position={[0, 1.15, 0.005]}>
          <planeGeometry args={[3.1, 1.95]} />
          <meshStandardMaterial
            map={devisTex}
            emissiveMap={devisTex}
            emissiveIntensity={0.6}
            transparent
            opacity={devisScreenOpacity}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 1 — Reveal: ThreeCanvas + "Devizly" title (0–150)
   ═══════════════════════════════════════════════════════════ */

function RevealOverlay() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Devizly" text appears at frame 60
  const titleProgress = spring({
    frame: frame - 55,
    fps,
    config: { damping: 15, stiffness: 200 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.85, 1]);

  if (frame < 50) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 220,
        fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: -2,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textShadow: "0 4px 30px rgba(124, 58, 237, 0.4)",
        }}
      >
        Devizly
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 2 — Feature pills + connecting lines (150–300)
   ═══════════════════════════════════════════════════════════ */

const featurePills = [
  { text: "✨ IA génère le devis", x: 40, y: 520, color: "#7c3aed" },
  { text: "✍️ Signature en ligne", x: 60, y: 680, color: "#7c3aed" },
  { text: "💸 Facture automatique", x: 40, y: 840, color: "#22c55e" },
];

// Approximate MacBook screen center in 2D space (shifted right during features)
const SCREEN_CENTER = { x: 720, y: 880 };

function FeaturesOverlay() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* SVG connecting lines */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {featurePills.map((pill, i) => {
          const delay = i * 20 + 10;
          const drawProgress = interpolate(frame - delay, [0, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const pathLength = 500;
          const dashOffset = pathLength * (1 - drawProgress);

          return (
            <line
              key={`line-${i}`}
              x1={pill.x + 120}
              y1={pill.y + 20}
              x2={SCREEN_CENTER.x}
              y2={SCREEN_CENTER.y}
              stroke={pill.color}
              strokeWidth={1.5}
              strokeOpacity={0.4 * drawProgress}
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>

      {/* Pill badges */}
      {featurePills.map((pill, i) => {
        const delay = i * 20;
        const pillProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const pillScale = interpolate(pillProgress, [0, 1], [0.6, 1]);
        const pillOpacity = interpolate(pillProgress, [0, 1], [0, 1]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pill.x,
              top: pill.y,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(12px)",
              borderRadius: 999,
              padding: "16px 32px",
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              whiteSpace: "nowrap",
              opacity: pillOpacity,
              transform: `scale(${pillScale})`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            {pill.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 3 — Stat counter "30 secondes" (300–390)
   ═══════════════════════════════════════════════════════════ */

function StatScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "30" — scale explosion
  const numSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0, 1.1]);
  const numSettle = spring({
    frame: frame - 18,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const finalNumScale =
    frame < 18 ? numScale : interpolate(numSettle, [0, 1], [1.1, 1.0]);
  const numOpacity = interpolate(numSpring, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Counter animation
  const counterVal = interpolate(frame, [5, 40], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "secondes"
  const secOpacity = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtext
  const subOpacity = interpolate(frame, [40, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particle circles
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 200 + (i % 3) * 100;
    return {
      cx: 540 + Math.cos(angle) * radius,
      cy: 850 + Math.sin(angle) * radius,
      r: 4 + (i % 4) * 3,
      delay: i * 3,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#7c3aed",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Floating particles */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {particles.map((p, i) => {
          const pOpacity = interpolate(frame - p.delay, [0, 15], [0, 0.25], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const floatY = Math.sin((frame + p.delay * 10) * 0.06) * 15;
          return (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy + floatY}
              r={p.r}
              fill="white"
              opacity={pOpacity}
            />
          );
        })}
      </svg>

      <div
        style={{
          fontSize: 220,
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1,
          opacity: numOpacity,
          transform: `scale(${finalNumScale})`,
        }}
      >
        {Math.round(counterVal)}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 300,
          color: "#ffffff",
          opacity: secOpacity,
        }}
      >
        secondes
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 300,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.8)",
          opacity: subOpacity,
          marginTop: 10,
        }}
      >
        Pendant que tu passes 2h sur Excel.
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE 4 — CTA (390–450)
   ═══════════════════════════════════════════════════════════ */

function CTAScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Essaie gratuitement" — slide up
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // "devizly.fr" — pulse
  const pulsePhase = Math.max(0, frame - 15);
  const pulseScale =
    frame >= 15 ? 1 + 0.04 * Math.sin((pulsePhase / 30) * Math.PI * 2) : 0;
  const urlOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtext
  const subOpacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // French badge (appears at ~global frame 420 = local frame 30)
  const badgeOpacity = interpolate(frame, [28, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #7c3aed 0%, #1a0a2e 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        flexDirection: "column",
        gap: 30,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.2,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Essaie
        <br />
        gratuitement
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          opacity: urlOpacity,
          transform: `scale(${pulseScale})`,
        }}
      >
        devizly.fr
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          opacity: subOpacity,
        }}
      >
        Sans CB · 14 jours
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 400,
          color: "rgba(255,255,255,0.6)",
          opacity: badgeOpacity,
          marginTop: 20,
        }}
      >
        🇫🇷 IA française · RGPD · 14 jours gratuits
      </div>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPOSITION
   ═══════════════════════════════════════════════════════════ */

export const AppleAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // MacBook opacity: fade out frames 295–315
  const macbookOpacity = interpolate(frame, [295, 315], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Show 3D canvas only when MacBook is visible (optimization)
  const show3D = frame < 320;

  return (
    <AbsoluteFill>
      {/* ── Dark gradient background (scenes 1–3) ── */}
      {frame < 390 && (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #0a0a0a 0%, #120a20 50%, #1a0a2e 100%)",
          }}
        />
      )}

      {/* ── 3D MacBook scene (scenes 1–2) ── */}
      {show3D && (
        <ThreeCanvas width={width} height={height}>
          <CameraRig frame={frame} fps={fps} />

          {/* Lighting — bright Apple keynote style */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[4, 6, 3]}
            intensity={2.5}
            color="#ffffff"
          />
          {/* Front fill light for screen visibility */}
          <pointLight
            position={[0, 2, 5]}
            intensity={3.0}
            color="#ffffff"
            distance={15}
          />
          <pointLight
            position={[-3, -3, 3]}
            intensity={2.5}
            color="#7c3aed"
            distance={12}
          />
          <pointLight
            position={[3, -2, -2]}
            intensity={1.0}
            color="#3b0a8a"
            distance={10}
          />

          {/* MacBook */}
          <MacBookMesh
            frame={frame}
            fps={fps}
            macbookOpacity={macbookOpacity}
          />
        </ThreeCanvas>
      )}

      {/* ── 2D Overlay: "Devizly" title (scene 1) ── */}
      <Sequence from={0} durationInFrames={155} premountFor={10} layout="none">
        <RevealOverlay />
      </Sequence>

      {/* ── 2D Overlay: Feature pills (scene 2) ── */}
      <Sequence from={155} durationInFrames={145} premountFor={10} layout="none">
        <FeaturesOverlay />
      </Sequence>

      {/* ── Stat counter (scene 3) ── */}
      <Sequence from={300} durationInFrames={90} premountFor={10}>
        <StatScene />
      </Sequence>

      {/* ── CTA (scene 4) ── */}
      <Sequence from={390} durationInFrames={60} premountFor={10}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
