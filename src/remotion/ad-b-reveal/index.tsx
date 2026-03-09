import { registerRoot, Composition } from "remotion";
import { AdBReveal } from "./AdBReveal";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AdBReveal"
      component={AdBReveal}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
    />
  );
};

registerRoot(RemotionRoot);
