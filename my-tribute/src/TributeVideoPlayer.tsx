import { useEffect, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { TributeVideo, totalFrames } from './TributeVideo';

import { preprocess } from './tools/preprocess';

// import tributeData from './tribute.json';
import tributeData from './long_tribute.json';


export const TributePlayer: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  // useEffect(() => {
  //   if (playerRef.current) {
  //     console.log(playerRef.current.getCurrentFrame());
  //   }
  // }, []);

  const {
		mediaAssets,
		totalFrames,
	} = preprocess(tributeData);

  return (
    <Player
      ref={playerRef}
      component={TributeVideo}
      fps={30}
      autoplay={true}
      controls={true}
      allowFullScreen={true}
      doubleClickToFullscreen={true}
      showVolumeControls={true}
      compositionHeight={320}
      compositionWidth={240}
      durationInFrames={totalFrames}
      inputProps={{mediaAssets: mediaAssets}}
      // other props
    />
  );
}
