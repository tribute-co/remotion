interface TAudioWorkletProcessor {
	readonly port: MessagePort;
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean;
}

declare let AudioWorkletProcessor: {
	prototype: TAudioWorkletProcessor;
	new (options?: AudioWorkletNodeOptions): TAudioWorkletProcessor;
};

declare function registerProcessor(
	name: string,
	processorCtor: (new (
		options?: AudioWorkletNodeOptions
	) => TAudioWorkletProcessor) & {
		parameterDescriptors?: AudioParamDescriptor[];
	}
): undefined;

class PTModuleProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
	}

	static get parameterDescriptors() {
		return [
			{
				name: 'frequency',
				defaultValue: 440.0,
				minValue: 27.5,
				maxValue: 4186.009,
			},
		];
	}

	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean {
		const numberOfInputs = inputs.length;
		const firstInput = inputs[0];
		console.log(outputs, currentTime);
		return true;
	}
}

registerProcessor('analyser', PTModuleProcessor);
