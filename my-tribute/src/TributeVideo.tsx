import { BlockList } from 'net';
import React from 'react';
import { Composition, useVideoConfig, Sequence, Video } from "remotion";
import tribute_data from './long_tribute.json';


export const TributeVideo: React.FC = () => {
	const { width, height, fps, durationInFrames } = useVideoConfig();

	const { media, playlist } = tribute_data;
	let ordered_playlist = [];

	let current_frame = 0;  // frame to cut each divider
	let duration:number = 0;  // duration (in frames) for each piece

	for (let idx=0; idx < playlist.length; idx++) {
		console.log("Frame: ", current_frame);
		console.log("Duration: ", duration);
		const sequence_data = media[playlist[idx]];
		duration = parseInt(sequence_data.duration * fps);

		switch (sequence_data.type) {
			case 'title':
				const { background, textFields} = sequence_data;
				ordered_playlist.push(<Sequence from={current_frame} durationInFrames={duration}>
					{textFields && textFields.map(data => (
						<span
						style={{
							fontSize: data.fontSize + "px",
							backgroundColor: background,
							color: data.fontColor,
							fontFamily: data.fontFamily,
							fontWeight: data.fontWeight,
							display: 'block',
							padding: '1em',
							position: 'absolute',
							textAlign: 'center',
							width: data.width * width,
							height: data.height * height,
							top: data.y * width,
							left: data.x * height,
						}}
						>{data.text}</span>
					))}
				</Sequence>);
				break;

			case 'video':
				ordered_playlist.push(<Sequence from={current_frame} durationInFrames={duration}>
					<Video
						src={sequence_data.video}
						// startFrom={59} // if video is 30fps, then it will start at 2s
						// endAt={120} // if video is 30fps, then it will end at 4s
						style={{height: height, width: width}}
					/>
				</Sequence>);
				break;

			case 'img':
				ordered_playlist.push(<Sequence from={current_frame} durationInFrames={duration}>
					<img src={sequence_data.img} style={{ textAlign: 'center' }}/>
				</Sequence>);
				break;

			default:
				console.error("Unknown type to render!")
		}
		current_frame = current_frame + duration;
	};
	console.log(fps);

  return (
		<div style={{flex:1, backgroundColor: 'black'}}>
			{ordered_playlist}
		</div>
  );
}
