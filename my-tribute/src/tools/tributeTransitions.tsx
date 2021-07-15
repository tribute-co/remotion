import { interpolate, useVideoConfig } from "remotion";

// in seconds
const transitionDuration = 1;
// in frames

export const crossZoom = (frame:number) => {
  /* cross zoom transition <TBD> */
  console.log(`cross zoom on frame ${frame}!!!`);
}

export const fadeIn = (frame:number) => {
  /* fade in transition */
  const { fps, width, height } = useVideoConfig();
  const transitionDurationInFrames = Math.round(transitionDuration * fps);
  return {
    opacity: interpolate(
      frame,
      [0, transitionDurationInFrames],
      [0, 1],
      {extrapolateRight: 'clamp'}
    )
  }
}
