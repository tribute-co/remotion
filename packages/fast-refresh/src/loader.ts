import RefreshModuleRuntime from './refresh-runtime';

let refreshModuleRuntime = RefreshModuleRuntime.toString();
refreshModuleRuntime = refreshModuleRuntime.slice(
	refreshModuleRuntime.indexOf('{') + 1,
	refreshModuleRuntime.lastIndexOf('}')
);

const ReactRefreshLoader = function ReactRefreshLoader(
	source: string,
	inputSourceMap: unknown
) {
	this.callback(null, `${source}\n\n;${refreshModuleRuntime}`, inputSourceMap);
};

export default ReactRefreshLoader;
