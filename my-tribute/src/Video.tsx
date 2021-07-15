import {Composition, useVideoConfig} from 'remotion';
import {HelloWorld} from './HelloWorld';
import {TributeVideo} from './TributeVideo';
// import { TributePlayer } from './TributeVideoPlayer';

import { preprocess } from './tools/preprocess';

// import tributeData from './long_tribute.json';
import tributeData from './tribute.json';


export const RemotionVideo: React.FC = () => {

	const {
		mediaAssets,
		totalFrames,
	} = preprocess(tributeData);
	// console.log(totalFrames);

	return (
		<>
			<Composition
				id="Tribute"
				component={TributeVideo}
				durationInFrames={totalFrames}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: "Tribute video",
					titleColor: 'black',
					mediaAssets,
					totalFrames,
				}}
			/>
			{/* <Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: 'Welcome to Remotion',
					titleColor: 'black',
				}}
			/>
			<Composition
				id="Logo"
				component={Logo}
				durationInFrames={200}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="Title"
				component={Title}
				durationInFrames={100}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: 'Welcome to Remotion',
					titleColor: 'black',
				}}
			/>
			<Composition
				id="Subtitle"
				component={Subtitle}
				durationInFrames={100}
				fps={30}
				width={1920}
				height={1080}
			/> */}
		</>
	);
};
