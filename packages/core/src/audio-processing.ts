const ctxBuffer = null;

(document.getElementById('files') as HTMLInputElement).addEventListener(
	'change',
	handleFileSelect,
	false
);

async function handleFileSelect(evt: Event) {
	const target = evt.target as HTMLInputElement; // FileList object
	const files = target.files as FileList;

	// I'm consistently loading one file here
	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		const context = new OfflineAudioContext({
			length: 44100 * 2,
			sampleRate: 44100,
			numberOfChannels: 2,
		});
		await context.audioWorklet.addModule('/dist/audio-worklet.js');

		const node = new AudioWorkletNode(context, 'analyser');

		const decodeAudio = function (f: ProgressEvent<FileReader>) {
			console.log('Creating buffer...');
			context.decodeAudioData(
				(f.target as FileReader).result as ArrayBuffer,
				processBuffer,
				(err) => {
					console.log(err);
				}
			);
		};

		const processBuffer = (buffer: AudioBuffer) => {
			const data = buffer.getChannelData(0);
			console.log(data);
			const source = context.createBufferSource();

			console.log('starting');
			source.start(0);
			context.startRendering();
		};

		// TODO: filter audio which can be processed
		const reader = new FileReader();
		reader.onloadend = decodeAudio;
		reader.readAsArrayBuffer(file);
	}
}
