import React from "react";
import { Composition } from "remotion";
import { WIDTH, HEIGHT, FPS } from "./constants";
import { timings } from "./utils/timings";
import { Ad1PainHook } from "./ads/Ad1PainHook";
import { Ad2BeforeAfter } from "./ads/Ad2BeforeAfter";
import { Ad3StatChoc } from "./ads/Ad3StatChoc";
import { Ad4Signature } from "./ads/Ad4Signature";
import { Ad5Pricing } from "./ads/Ad5Pricing";
import { Ad6SocialProof } from "./ads/Ad6SocialProof";
import { Ad7CTA } from "./ads/Ad7CTA";

/** Duration = audio end + 2s CTA buffer, in frames */
function dur(adId: string): number {
  const audio = timings[adId]?.totalDuration ?? 15;
  return Math.ceil((audio + 2) * FPS);
}

export const RemotionAds: React.FC = () => {
  return (
    <>
      <Composition id="Ad1PainHook" component={Ad1PainHook} durationInFrames={dur("ad1")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad2BeforeAfter" component={Ad2BeforeAfter} durationInFrames={dur("ad2")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad3StatChoc" component={Ad3StatChoc} durationInFrames={dur("ad3")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad4Signature" component={Ad4Signature} durationInFrames={dur("ad4")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad5Pricing" component={Ad5Pricing} durationInFrames={dur("ad5")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad6SocialProof" component={Ad6SocialProof} durationInFrames={dur("ad6")} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Ad7CTA" component={Ad7CTA} durationInFrames={dur("ad7")} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
