import { registerRoot, Composition } from "remotion";
import { AdCDemo } from "./AdCDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AdCDemo"
      component={AdCDemo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
    />
  );
};

registerRoot(RemotionRoot);
