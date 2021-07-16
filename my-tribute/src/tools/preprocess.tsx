// import { useState } from "react";
import {
	Audio,
	Composition,
  // Config,
  Easing,
  interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from "remotion";

import {
  TributeAssetTitle,
  TributeAssetImg,
  TributeAssetVideo,
} from "./tributeAssets";

import '../styles/fonts.css';


type TimeRange = {
  from: number,
  to: number,
}


const mergeRange = (rangeA:TimeRange, rangeB:TimeRange) => {
  // this returns a list of one element (if merged)
  // or a list of 2 elements, if there are not overlapped
  if ((rangeA.from >= rangeB.from && rangeA.from <= rangeB.to) || (rangeA.to >= rangeB.from && rangeA.to <= rangeB.to)) {
    return {
      from: Math.min(rangeA.from, rangeB.from),
      to: Math.max(rangeA.to, rangeB.to),
    };
  } else {
    return rangeB;
  }
}


const recursiveMerge = (range:TimeRange, listToMerge:Array<TimeRange>) => {
  /*
  Recursive way of merging ranges in a list, in order. So:
  if:
    [2, 5] and [8, 10] are in the list,
  and [3, 9] wants to be merged,
  then, the 3 items are merged into:
    1. [2, 5], [8, 10] and [3, 9] -> [2, 9], [8, 10]
    2. [2, 9], [8, 10] -> [2, 10]
   */
  if (listToMerge.length === 0) {
    return [range];
  }

  let restOfList = listToMerge.slice();
  const firstElem = restOfList.shift()!;
  // const restOfList:Array<TimeRange> = listToMerge.shift();
  const merged = mergeRange(range, firstElem);
  if (merged != firstElem) {
    return recursiveMerge(merged, restOfList);
  } else {
    return [firstElem].concat(recursiveMerge(range, restOfList));
  }
}


export const preprocess = (
  tributeContent:object,
  hasIntro:boolean=true,
  hasOutro:boolean=true,
) => {

  const fps = 30;

  // const {
  //   hasIntro,
  //   hasOutro
  // } = useState();

  let mediaAssets = [];

  // time ranges for muting tracks
  let muteTrackRanges:Array<TimeRange> = [];
  // time ranges for dimmed-volume tracks
  let dimmedTrackRanges:Array<TimeRange> = [];
  // volume level when dimmed (as background music when playing video)
  const mutedVolume = 0.0;
  const dimmedVolume = 0.2;

  let currentFrame = 0;
  let totalFrames = 0;

  const transitionDuration = 1;                                 // in seconds
  const transitionDurationInFrames = Math.round(transitionDuration * fps);  // in frames

  // get media sequences
  const { media, playlist, tracks } = tributeContent;

  // intro constants
  const introDuration = 7.34;
  const introVolume = 0.4;
  const introDurationInFrames = Math.round(introDuration * fps);

  let audioTrackInitialFrame = 0;
  let audioTrackFinalFrame = 0;

  // outro constants
  const outroDuration = 8.8;
  const outroVolume = 0.4;
  const outroDurationInFrames = Math.round(outroDuration * fps);


  const addRangeToDimVolumeList = (since:number, until:number, mute:boolean = true) => {
    /* add a new range by merging with already existing if overlaps
    */
    if (since === until) {
      // do nothing
      return;
    }
    const range:TimeRange = {from: since, to: until};
    if (mute) {
      muteTrackRanges = recursiveMerge(range, muteTrackRanges);
    } else {
      dimmedTrackRanges = recursiveMerge(range, dimmedTrackRanges);
    }
    // console.log("muteRange length: " + muteTrackRanges.length);
  }

  if (hasIntro) {
    // console.info("Starting INTRO pre-processing");

    mediaAssets.push(
      <Sequence
        name="Intro"
        key={`intro`}
        from={currentFrame}
        durationInFrames={introDurationInFrames}
      >
        <Video
          src="https://tribute-video-assets.s3.amazonaws.com/tribute_intro_jingle_video_7s.mp4"
          volume={introVolume}
          startFrom={0}
          endAt={introDurationInFrames}
          style={{
            height: "100%",
            width: "100%"
          }}
        />
      </Sequence>
      // "muteBackgroundMusic": true,
      // "isIntro": true,
      // "rotationIndex": 0,
      // "transition": "DEFAULT_TRANSITION"
    );

    // silent during intro
    addRangeToDimVolumeList(audioTrackInitialFrame, introDurationInFrames);
    currentFrame += introDurationInFrames;
    totalFrames += introDurationInFrames;
    // console.info("Completed INTRO pre-processing");
  }

  // console.info("Starting entire media playlist pre-processing");
  for (let idx=0; idx < playlist.length; idx++) {
    const currentElem = media[playlist[idx]];
    let elemDurationInFrames = Math.round(parseInt(currentElem.duration) * fps);
    let elemTransition = (frame:number) => ({});

    // console.info(`media ${playlist[idx]} has ${elemDurationInFrames} frames. New total frames: ${totalFrames}`);
    totalFrames += elemDurationInFrames;

    if (currentElem.transition) {
      // move video ahead to overlap previous one all transition along
      currentFrame -= transitionDurationInFrames;
      totalFrames -= transitionDurationInFrames;
      // if (idx === 0) {
      //   // when first element starts, audio track start
      //   audioTrackInitialFrame = currentFrame;
      // }

      // check what type of transition is
      // fadein by default
      elemTransition = (frame:number) => (
        {
          opacity: interpolate(
            frame,
            [currentFrame, currentFrame + transitionDurationInFrames],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )
        }
      )
    }

    if (currentElem.muteBackgroundMusic) {
      // add video frames range to silence tracks
      addRangeToDimVolumeList(currentFrame, currentFrame + elemDurationInFrames);
    } else {
      if (currentElem.type === 'video') {
        addRangeToDimVolumeList(currentFrame, currentFrame + elemDurationInFrames, false);
      }
    }

    const frame = useCurrentFrame();

		switch (currentElem.type) {
      case 'video':
        // const {
        //   filter,
        //   duration,
        //   uploader,
        //   video_hq,
        //   muteBackgroundMusic,
        // } = currentElem;
        const [videoStart, videoEnd] = currentElem.trim;

        elemDurationInFrames = Math.round((parseInt(videoEnd) - parseInt(videoStart)) * fps);

        mediaAssets.push(
          <Sequence
            name={`Seq elem #${idx} - Video`}
            key={`seq#${idx}`}
            from={currentFrame}
            durationInFrames={elemDurationInFrames}
          >
            <TributeAssetVideo
              key={`title#${idx}`}
              src={currentElem.video}
              transition={currentElem.transition}
              rotation={currentElem.rotationIndex}
              volume={currentElem.volume}
            />
          </Sequence>
        );
        break;

      case 'title':
        mediaAssets.push(
          <Sequence
            name={`Seq elem #${idx} - Title`}
            from={currentFrame}
            key={`seq#${idx}`}
            durationInFrames={elemDurationInFrames}
          >
            {currentElem.textFields.map((data:any, idx:number) => (
              <TributeAssetTitle
                key={`title#${idx}`}
                data={data}
                background={currentElem.background}
                transition={currentElem.transition}
                rotation={currentElem.rotationIndex}
              />
            ))}
          </Sequence>
        );
        break;

      case 'img':
        mediaAssets.push(
          <Sequence
            name={`Seq elem #${idx} - Image`}
            key={`seq#${idx}`}
            from={currentFrame}
            durationInFrames={elemDurationInFrames}
          >
            <TributeAssetImg
              src={currentElem.img}
              transition={currentElem.transition}
              rotation={currentElem.rotationIndex}
            />
          </Sequence>
        );
        break;

      default:
        console.error("Unknown type to render!")
    }
    // update the current frame for next sequence elem
    currentFrame += elemDurationInFrames;
  }
  // console.info("Completed entire media playlist pre-processing");

  audioTrackFinalFrame = totalFrames;

  if (hasOutro === true) {
    // console.info("Starting OUTRO pre-processing");
    // if outro has transition
    totalFrames += outroDurationInFrames;
    const outroHasTransition = false;
    if (outroHasTransition) {
      // move video ahead to overlap previous one [smaller] transition along
      currentFrame -= transitionDurationInFrames;
      totalFrames -= transitionDurationInFrames;
      audioTrackFinalFrame -= transitionDurationInFrames;
    }
    addRangeToDimVolumeList(audioTrackFinalFrame, totalFrames);

    mediaAssets.push(
      <Sequence
        name="Outro"
        key={`seq#outro`}
        from={currentFrame}
        durationInFrames={outroDurationInFrames}
      >
        <TributeAssetVideo
          src="https://tribute-video-assets.s3.amazonaws.com/tribute_intro_jingle_video_7s.mp4"
          volume={outroVolume}
          startFrom={0}
          endAt={outroDurationInFrames}
        />
      </Sequence>
    );
    // console.info("Completed OUTRO pre-processing");
  }

  const volumeHandler = (f:number, frameOffset:number, originalVolume:number) => {
    // given frame check on mute ranges if some range contains it.
    const frame = f + frameOffset;
    let mutedOutputVolume = 1;
    let dimmedOutputVolume = 1;
    // const audioTransition = transitionDurationInFrames * 2;
    const audioTransition = transitionDurationInFrames;

    for (let i=0; i < muteTrackRanges.length; i++) {
      const {from, to} = muteTrackRanges[i];
      const initTransitionFrame = from - audioTransition;
      const endTransitionFrame = to + audioTransition;

      if ((frame >= initTransitionFrame) && (frame <= endTransitionFrame)) {
        mutedOutputVolume = interpolate(
          frame,
          [initTransitionFrame, from, to, endTransitionFrame],
          [originalVolume, mutedVolume, mutedVolume, originalVolume],
          {
            easing: Easing.bezier(0.82, 0.32, 0.54, 0.64),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );
      }
    }

    for (let i=0; i < dimmedTrackRanges.length; i++) {
      const {from, to} = dimmedTrackRanges[i];
      const initTransitionFrame = from - audioTransition;
      const endTransitionFrame = to + audioTransition;

      if ((frame >= initTransitionFrame) && (frame <= endTransitionFrame)) {
        dimmedOutputVolume = interpolate(
          frame,
          [initTransitionFrame, from, to - audioTransition, to],
          [originalVolume, dimmedVolume, dimmedVolume, originalVolume],
          {
            easing: Easing.bezier(0.82, 0.32, 0.54, 0.64),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        )
      }
    }

    // console.log(`frame: ${frame}, muted: ${mutedOutputVolume}, dimmed: ${dimmedOutputVolume}, OUTPUT: ${Math.min(mutedOutputVolume, dimmedOutputVolume)}`);
    return Math.min(mutedOutputVolume, dimmedOutputVolume);
    // return dimmedOutputVolume;
  }

  // audio starts when first media element starts
  let initAudioFrame = audioTrackInitialFrame;

  // get tracks
  // console.info("Starting audio tracks pre-processing");
  for (let idx=0; idx < tracks.length; idx++) {
  	const {
  		start,
  		volume,
  		duration,
  		originalDuration,
      title,
  		// end,    // always 0, not used
  		src,
  	} = tracks[idx];

    const initialFrame = initAudioFrame;
    const trackDurationInFrames = Math.round(parseInt(duration) * fps);
    const remainingFrames = audioTrackFinalFrame - initialFrame;
    const realAudioDurationFrames = remainingFrames >= 0 ? Math.min(remainingFrames, trackDurationInFrames) : 0;

    // console.log(`Real Audio duration: ${realAudioDurationFrames}`)
    // console.log("initialFrame: ", initialFrame);
    mediaAssets.push(
      <Sequence
        name={`Audio Track #${idx} - ${title}`}
        key={`audio#${idx}`}
        from={initialFrame}
        durationInFrames={trackDurationInFrames}
      >
        <Audio
          src={src}
          startFrom={start * fps}
          volume={f => volumeHandler(f, initialFrame, volume)}
          // in loop only if there's only one track
          loop={tracks.length === 0}
          endAt={trackDurationInFrames}
          // endAt={end * fps}
        />
      </Sequence>
    );

    // next audio track starts when current ends
    initAudioFrame += trackDurationInFrames;
  }
  // console.info("Completed audio tracks pre-processing");

  return {
    mediaAssets: mediaAssets,
    totalFrames: totalFrames,
  };
}
