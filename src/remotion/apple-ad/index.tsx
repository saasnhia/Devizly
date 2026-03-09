import { registerRoot, Composition } from "remotion";
import { AppleAd } from "./AppleAd";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AppleAd"
      component={AppleAd}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
    />
  );
};

registerRoot(RemotionRoot);
