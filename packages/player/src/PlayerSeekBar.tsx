import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {useElementSize} from './use-element-size';
import {useHoverState} from './use-hover-state';

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number
) => {
	const pos = clientX;
	const frame = Math.round(
		interpolate(pos, [0, width], [0, durationInFrames - 1 ?? 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	return frame;
};

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;

const containerStyle: React.CSSProperties = {
	userSelect: 'none',
	paddingTop: VERTICAL_PADDING,
	paddingBottom: VERTICAL_PADDING,
	boxSizing: 'border-box',
	cursor: 'pointer',
	position: 'relative',
};

const barBackground: React.CSSProperties = {
	height: BAR_HEIGHT,
	backgroundColor: 'rgba(255, 255, 255, 0.5)',
	width: '100%',
	borderRadius: BAR_HEIGHT / 2,
};

export const PlayerSeekBar: React.FC<{
	durationInFrames: number;
}> = ({durationInFrames}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const barHovered = useHoverState(containerRef);
	const size = useElementSize(containerRef);
	const frame = Internals.Timeline.useTimelinePosition();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();

	const [playing, setPlaying] = Internals.Timeline.usePlayingState();

	const [dragging, setDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: true;
				wasPlaying: boolean;
		  }
	>({
		dragging: false,
	});

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!size) {
				throw new Error('Player has no size');
			}
			const _frame = getFrameFromX(
				e.clientX - size.left,
				durationInFrames,
				size.width
			);
			setTimelinePosition(_frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			setPlaying(false);
		},
		[durationInFrames, playing, setPlaying, setTimelinePosition, size]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!size) {
				throw new Error('Player has no size');
			}
			if (!dragging.dragging) {
				return;
			}
			const _frame = getFrameFromX(
				e.clientX - (size?.left ?? 0),
				durationInFrames,
				size.width
			);
			setTimelinePosition(_frame);
		},
		[dragging.dragging, durationInFrames, setTimelinePosition, size]
	);

	const onPointerUp = useCallback(() => {
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}
		setPlaying(dragging.wasPlaying);
	}, [dragging, setPlaying]);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [dragging.dragging, onPointerMove, onPointerUp]);

	const knobStyle: React.CSSProperties = useMemo(() => {
		return {
			height: KNOB_SIZE,
			width: KNOB_SIZE,
			borderRadius: KNOB_SIZE / 2,
			position: 'absolute',
			top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
			backgroundColor: 'white',
			left: (frame / durationInFrames) * ((size?.width ?? 0) - KNOB_SIZE),
			boxShadow: '0 0 2px black',
			opacity: Number(barHovered),
		};
	}, [barHovered, durationInFrames, frame, size?.width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'rgba(255, 255, 255, 1)',
			width: (frame / durationInFrames) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [durationInFrames, frame]);

	return (
		<div
			ref={containerRef}
			onPointerDown={onPointerDown}
			onPointerUp={onPointerUp}
			style={containerStyle}
		>
			<div style={barBackground}>
				<div style={fillStyle} />
			</div>
			<div style={knobStyle} />
		</div>
	);
};