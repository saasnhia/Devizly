import { registerRoot, Composition } from "remotion";
import { AdAPain } from "./AdAPain";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AdAPain"
      component={AdAPain}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
    />
  );
};

registerRoot(RemotionRoot);
