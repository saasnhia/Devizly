import { AbsoluteFill, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();
const font = fontFamily;

const C = {
  bg: "#FAFBFC",
  dark: "#0F172A",
  muted: "#64748B",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
  lightViolet: "#EEF2FF",
};

/* ── Logo SVG ──────────────────────────────────── */

function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill={C.violet} />
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="white"
        opacity="0.9"
      />
      <path d="M25 18L20 26H24L22 34L29 24H25L27 18Z" fill={C.violet} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   LINKEDIN COMPANY BANNER — 1128 x 191
   Light design, ultra-compact for company page format
   ══════════════════════════════════════════════════ */

export const LinkedInBanner: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.bg} 0%, #F0EDFF 50%, ${C.bg} 100%)`,
        fontFamily: font,
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Single row layout — padded left for profile pic dead zone */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 148,
          paddingRight: 40,
          zIndex: 1,
        }}
      >
        {/* LEFT — Logo + text, all compact */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Row 1: Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={28} />
            <span
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: C.dark,
                letterSpacing: -1,
              }}
            >
              Devizly
            </span>
          </div>

          {/* Row 2: Tagline + subtitle */}
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.dark,
              marginTop: 4,
              letterSpacing: -0.3,
            }}
          >
            L&apos;IA des devis pros —{" "}
            <span style={{ fontWeight: 500, color: C.muted, fontSize: 12 }}>
              Generez, envoyez et signez en 30s
            </span>
          </p>

          {/* Row 3: CTA + badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: C.violet,
                borderRadius: 6,
                padding: "4px 14px",
                boxShadow: `0 2px 8px ${C.violet}30`,
              }}
            >
              <span
                style={{ fontSize: 12, fontWeight: 700, color: C.white }}
              >
                devizly.fr
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.emerald,
                background: "#ECFDF5",
                padding: "3px 8px",
                borderRadius: 5,
              }}
            >
              Gratuit
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.violet,
                background: C.lightViolet,
                padding: "3px 8px",
                borderRadius: 5,
              }}
            >
              IA Mistral
            </span>
          </div>
        </div>

        {/* RIGHT — Full screenshot mockup, scaled to fit 191px */}
        <div
          style={{
            width: 160,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginLeft: 20,
          }}
        >
          <div
            style={{
              transform:
                "perspective(800px) rotateY(-6deg) rotateX(2deg)",
              width: 145,
            }}
          >
            <div
              style={{
                background: C.white,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Tiny title bar */}
              <div
                style={{
                  height: 12,
                  background: "#F6F6F8",
                  borderBottom: "1px solid #E5E5EA",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 5,
                }}
              >
                <div style={{ display: "flex", gap: 3 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FEBC2E" }} />
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#28C840" }} />
                </div>
              </div>
              {/* Full screenshot scaled to fit */}
              <Img
                src={staticFile("marketing/screenshot-devis-share.png")}
                style={{ width: "100%", display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ══════════════════════════════════════════════════
   LINKEDIN BANNER PREVIEW — same as banner
   ══════════════════════════════════════════════════ */

export const LinkedInBannerPreview: React.FC = () => {
  return <LinkedInBanner />;
};

/* ══════════════════════════════════════════════════
   LINKEDIN PROFILE PIC — 400 x 400
   Light, matches banner
   ══════════════════════════════════════════════════ */

export const LinkedInProfilePic: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, #FFFFFF 0%, #F0EDFF 100%)`,
        fontFamily: font,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet}15 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          zIndex: 1,
        }}
      >
        <svg width={140} height={140} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill={C.violet} />
          <path
            d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M25 18L20 26H24L22 34L29 24H25L27 18Z"
            fill={C.violet}
          />
        </svg>

        <span
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: C.dark,
            letterSpacing: -1.5,
          }}
        >
          Devizly
        </span>

        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: C.violet,
            background: C.lightViolet,
            padding: "4px 14px",
            borderRadius: 20,
          }}
        >
          L&apos;IA des devis pros
        </span>
      </div>
    </AbsoluteFill>
  );
};
