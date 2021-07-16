import {useCurrentFrame, interpolate, Img, Video} from 'remotion';
import { crossZoom, fadeIn } from './tributeTransitions';

import '../styles/main.scss';

export const TributeAssetTitle: React.FC<{data: any; background: string; transition: string; rotation:number}> = ({data, background, transition, rotation}) => {

  const frame = useCurrentFrame();
  const padding = parseInt(data.fontSize);
  const boxPadding = `${padding}px`;

  // const styleTransition = transition === 'CROSS_ZOOM' ? crossZoom : null;
  const styleTransition = fadeIn;

  return (
    <span
      className="TributeAssetTitle"
      key={`title#bla`}
      style={{
        backgroundColor: background,
        color: data.fontColor,
        fontFamily: data.fontFamily,
        fontSize: data.fontSize + "pt",
        fontWeight: data.fontWeight,
        padding: boxPadding,
        // positioning
        height: `${data.height * 100}%`,
        width: `${data.width * 100}%`,
        top: `${data.y * 100}%`,
        left: `${data.x * 100}%`,
        // transform: `rotate(-10deg)`,
        transform: `rotate(${rotation}deg)`,
        ...styleTransition(frame),
      }}
    >
      {data.text}
    </span>
  );
}


export const TributeAssetImg: React.FC<{src: string; transition: string; rotation:number}> = ({src, transition, rotation}) => {

  const frame = useCurrentFrame();
  // TODO: map whichever comes in transition param
  const styleTransition = fadeIn;

  return (
    <Img
      key={`title#bla`}
      src={src}
      className='TributeAssetImg'
      style={{
        transform: `rotate(${rotation}deg)`,
        ...styleTransition(frame),
      }} />
  )
}


export const TributeAssetVideo: React.FC<{src: string; volume: number; transition: string; startFrom: number; endAt: number; rotation: number}> = ({src, volume, transition, startFrom, endAt, rotation}) => {

  const frame = useCurrentFrame();
  // TODO: map whichever comes in transition param
  const styleTransition = fadeIn;

  return (
    <Video
      key={`title#bla`}
      src={src}
      volume={volume}
      className='TributeAssetVideo'
      startFrom={startFrom}
      endAt={endAt}
      style={{
        height: "100%",
        width: "100%",
        transform: `rotate(${rotation}deg)`,
        ...styleTransition(frame),
      }} />
  )
}
