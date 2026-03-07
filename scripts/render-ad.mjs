/**
 * Render Devizly ad video using Remotion
 * Usage: node scripts/render-ad.mjs
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = join(__dirname, "..", "remotion", "index.ts");
const output = join(__dirname, "..", "public", "marketing", "devizly-ad-15s.mp4");

async function main() {
  console.log("Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: entry });

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "DevizlyAd",
  });

  console.log(`Rendering ${composition.durationInFrames} frames at ${composition.fps}fps...`);
  console.log(`Output: ${output}`);

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: output,
  });

  console.log("\nDone! Video saved to public/marketing/devizly-ad-15s.mp4");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
