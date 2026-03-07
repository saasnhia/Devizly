/**
 * Render LinkedIn assets as PNG:
 *   - linkedin-banner-v2.png       (1128x191 company page)
 *   - linkedin-banner-v2-preview.png (1128x191 preview)
 *   - linkedin-profile-pic.png     (400x400)
 * Usage: node scripts/render-linkedin.mjs
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = join(__dirname, "..", "remotion", "index.ts");
const outDir = join(__dirname, "..", "public", "marketing");

async function main() {
  console.log("Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: entry });

  // 1. LinkedIn Banner v2 (1128x191 company page)
  console.log("\n1/3 Rendering LinkedIn Banner v2 (1128x191)...");
  const bannerComp = await selectComposition({
    serveUrl: bundled,
    id: "LinkedInBanner",
  });
  await renderStill({
    composition: bannerComp,
    serveUrl: bundled,
    output: join(outDir, "linkedin-banner-v2.png"),
    frame: 0,
  });
  console.log("  -> linkedin-banner-v2.png");

  // 2. LinkedIn Banner Preview (1128x191)
  console.log("2/3 Rendering LinkedIn Banner Preview (1128x191)...");
  const previewComp = await selectComposition({
    serveUrl: bundled,
    id: "LinkedInBannerPreview",
  });
  await renderStill({
    composition: previewComp,
    serveUrl: bundled,
    output: join(outDir, "linkedin-banner-v2-preview.png"),
    frame: 0,
  });
  console.log("  -> linkedin-banner-v2-preview.png");

  // 3. LinkedIn Profile Pic (400x400)
  console.log("3/3 Rendering LinkedIn Profile Pic (400x400)...");
  const profileComp = await selectComposition({
    serveUrl: bundled,
    id: "LinkedInProfilePic",
  });
  await renderStill({
    composition: profileComp,
    serveUrl: bundled,
    output: join(outDir, "linkedin-profile-pic.png"),
    frame: 0,
  });
  console.log("  -> linkedin-profile-pic.png");

  console.log("\nDone! All assets saved to public/marketing/");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
