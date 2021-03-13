import React from 'react';
import {Sequence, Video} from 'remotion';
import test from './test.webm';

export const VideoTest: React.FC = () => {
	return (
		<>
			<Sequence from={30} durationInFrames={100}>
				<Sequence from={-20} durationInFrames={130}>
					<Video src={test} />
				</Sequence>
			</Sequence>
			<Sequence from={0} durationInFrames={30}>
				<Video src={test} />
			</Sequence>
		</>
	);
};

export default VideoTest;
