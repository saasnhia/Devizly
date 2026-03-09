import { registerRoot, Composition } from "remotion";
import { PremiumAd } from "./PremiumAd";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PremiumAd"
      component={PremiumAd}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
    />
  );
};

registerRoot(RemotionRoot);
