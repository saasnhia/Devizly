import { Composition } from "remotion";
import { DevizlyAd } from "./DevizlyAd";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DevizlyAd"
      component={DevizlyAd}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
