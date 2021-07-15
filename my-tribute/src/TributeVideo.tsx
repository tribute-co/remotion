import PropTypes from "prop-types";

export let totalFrames = 1300;  // total number of frames


type TributeTextField = {
	x: number,
	y: number,
	text: string,
	width: number,
	height: number,
	fontSize: number,
	fontColor: string,
	fontFamily: string,  // choices
	fontWeight: number
}


type TributeMediaItem = {
	duration: number,
	from: number,
	end: number,
	trim: Array<number>,
	type: string,
	video: string, // url
	filter: string, // choices from some list maybe?
	volume: number,
	uploader: string, // ?
	video_hq: string, // url
	textFields: Array<TributeTextField>,  // complete with this type
	transition: string,  // choices
	rotationIndex: number,
	muteBackgroundMusic: boolean,
	img: string,  // url
	background: string,  // hexa color
}


type TributeAudioTrack = {
	id: string,
	end: number,
	src: string,  // url
	blob: string,  // blob url
	start: number,
	title: string,
	volume: number,
	trackId?: string,
	audioTag?: string,
	duration: number,
	progress: number,
	widthUnits: Array<number>,
	startOffset: number,
	waveformUrl?: string,
	originalDuration: number
}


type TributeConfig = {
	applyKenburns: boolean,
	pauseMusicOnVideo: boolean,
	viginetteByDefault: boolean,
	backgroundMusicVolume: number,
	staticBackgroundMusicVolume: number
}


type Tribute = {
	id: string,
	media: {},
	config: TributeConfig,
	tracks: Array<TributeAudioTrack>,
	pending: Array<any>,
  restore: Array<any>,
  version: number,
  playlist: Array<string>
}


type TributeVideoProps = {
  tributeData: PropTypes.object,
}


export const TributeVideo:React.FC = ({mediaAssets}) => {
	return (
		<div style={{flex:1, backgroundColor: '#3b3b3b'}}>
			{mediaAssets}
		</div>
	);
}
