import React from 'react';
import {
	Audio,
	Composition,
	Sequence,
	Video,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

import tribute_data from './tribute.json';
// import tribute_data from './long_tribute.json';

export let totalFrames = 1300;  // total number of frames


const springTransformAnim = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({
    fps,
    from: 0,
    to: 1,
    frame
  });

  return `scale(${scale})`
}


export const TributeVideo: React.FC = () => {
	const {
		width,
		height,
		fps,
		durationInFrames,
  } = useVideoConfig();

	const { media, playlist, tracks } = tribute_data;

	let ordered_playlist = [];  // elements sequence
	let audio_tracks = [];      // audio tracks
	let current_frame = 0;      // frame to cut each divider
	let duration:number = 0;    // duration (in frames) for each piece
	let contentDuration:number = 0;  // duration (in frames) for media content (no audio tracks)

	// get tracks
	for (let idx=0; idx < tracks.length; idx++) {
		debugger;
		const {
			// start,  // always 0, not used
			// startOffset,
			// volume,
			duration,
			originalDuration,
			// end,    // always 0, not used
			src,
		} = tracks[idx];
		audio_tracks.push(
			<Audio
				key={`audio#${idx}`}
				src={src}
				startFrom={0}
				// startFrom={start * fps}
				endAt={parseInt(duration * fps)}
				// endAt={end * fps}
			/>
		);
	}

	// get media sequences
	for (let idx=0; idx < playlist.length; idx++) {
		// console.log("Frame: ", current_frame);
		const sequence_data = media[playlist[idx]];
		const elemDuration = parseInt(sequence_data.duration * fps);
		totalFrames = totalFrames + elemDuration;

		switch (sequence_data.type) {
			case 'title':
				const { background, textFields} = sequence_data;
				ordered_playlist.push(
					<Sequence
						from={current_frame}
						key={`seq#${idx}`}
						durationInFrames={elemDuration}
					>
						{textFields.map((data:object, idx:number) => {
							debugger;
							const padding = parseInt(data.fontSize);
							const boxPadding = `${padding}px`;
							const boxWidth = (data.width * width) - (padding * 2);
							const boxHeight = (data.height * height) - (padding * 2);
							const elemRotation = data.rotationIndex ? `rotate(${data.rotationIndex}deg)` : '';
							return (
								<span
									key={`title#${idx}`}
									style={{
										fontSize: data.fontSize + "px",
										backgroundColor: background,
										boxSizing: 'content-box',
										borderRadius: ".2em",
										color: data.fontColor,
										fontFamily: data.fontFamily,
										fontWeight: data.fontWeight,
										display: 'block',
										padding: boxPadding,
										position: 'absolute',
										textAlign: 'center',
										width: boxWidth,
										height: boxHeight,
										top: data.y * width,
										left: data.x * height,
										transform: elemRotation + " " + springTransformAnim(),
									}}
								>
									{data.text}
								</span>
							);
						})}
					</Sequence>
				);
				break;

			case 'video':
				const [videoStart, videoEnd] = sequence_data.trim;
				ordered_playlist.push(
					<Sequence
						key={`seq#${idx}`}
						from={current_frame}
						durationInFrames={elemDuration}
					>
						<Video
							src={sequence_data.video}
							startFrom={videoStart * fps}
							endAt={videoEnd * fps}
							style={{
								height: height,
								width: width
							}}
						/>
					</Sequence>
				);
				break;

			case 'img':
				ordered_playlist.push(
					<Sequence
						key={`seq#${idx}`}
						from={current_frame}
						durationInFrames={elemDuration}
					>
						<img
							src={sequence_data.img}
							style={{ textAlign: 'center' }} />
					</Sequence>
				);
				break;

			default:
				console.error("Unknown type to render!")
		}
		// update the current frame for next sequence elem
		current_frame = current_frame + elemDuration;
	};

	console.log(`Total # frames: ${totalFrames}`);

  return (
		<div style={{flex:1, backgroundColor: 'black'}}>
			{audio_tracks}
			{ordered_playlist}
		</div>
  );
}
