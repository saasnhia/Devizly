import { Composition } from "remotion";
import { DevizlyAd } from "./DevizlyAd";
import { DevizlyDemo } from "./DevizlyDemo";
import { LinkedInBanner, LinkedInBannerPreview, LinkedInProfilePic } from "./LinkedInAssets";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 90-second full product demo (1920x1080 landscape) */}
      <Composition
        id="DevizlyDemo"
        component={DevizlyDemo}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Original 15s ad (1080x1080 square) */}
      <Composition
        id="DevizlyAd"
        component={DevizlyAd}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="LinkedInBanner"
        component={LinkedInBanner}
        durationInFrames={1}
        fps={30}
        width={1128}
        height={191}
      />
      <Composition
        id="LinkedInBannerPreview"
        component={LinkedInBannerPreview}
        durationInFrames={1}
        fps={30}
        width={1128}
        height={191}
      />
      <Composition
        id="LinkedInProfilePic"
        component={LinkedInProfilePic}
        durationInFrames={1}
        fps={30}
        width={400}
        height={400}
      />
    </>
  );
};
