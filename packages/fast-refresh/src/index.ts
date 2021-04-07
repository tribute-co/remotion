import {
	Compiler,
	RuntimeGlobals,
	RuntimeModule,
	Template,
	version,
} from 'webpack';

class ReactRefreshRuntimeModule extends RuntimeModule {
	constructor() {
		super('react refresh', 5);
	}

	generate() {
		const {runtimeTemplate} = this.compilation;
		return Template.asString([
			`${
				RuntimeGlobals.interceptModuleExecution
			}.push(${runtimeTemplate.basicFunction('options', [
				'const originalFactory = options.factory;',
				`options.factory = ${runtimeTemplate.basicFunction(
					'moduleObject, moduleExports, webpackRequire',
					[
						// Legacy CSS implementations will `eval` browser code in a Node.js
						// context to extract CSS. For backwards compatibility, we need to check
						// we're in a browser context before continuing.
						'const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;',
						'const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};',
						'try {',
						Template.indent(
							'originalFactory.call(this, moduleObject, moduleExports, webpackRequire);'
						),
						'} finally {',
						Template.indent('cleanup();'),
						'}',
					]
				)}`,
			])})`,
		]);
	}
}

class ReactFreshWebpackPlugin {
	apply(compiler: Compiler) {
		const webpackMajorVersion = parseInt(version != null ? version : '', 10);

		if (webpackMajorVersion < 5) {
			throw new Error(
				`ReactFreshWebpackPlugin does not support webpack v${webpackMajorVersion}.`
			);
		}

		compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
			compilation.mainTemplate.hooks.localVars.tap(
				this.constructor.name,
				(source) =>
					Template.asString([
						source,
						'',
						'// noop fns to prevent runtime errors during initialization',
						'if (typeof self !== "undefined") {',
						Template.indent('self.$RefreshReg$ = function () {};'),
						Template.indent('self.$RefreshSig$ = function () {'),
						Template.indent(Template.indent('return function (type) {')),
						Template.indent(Template.indent(Template.indent('return type;'))),
						Template.indent(Template.indent('};')),
						Template.indent('};'),
						'}',
					])
			);

			compilation.hooks.additionalTreeRuntimeRequirements.tap(
				this.constructor.name,
				(chunk) => {
					compilation.addRuntimeModule(chunk, new ReactRefreshRuntimeModule());
				}
			);
		});
	}
}

module.exports = ReactFreshWebpackPlugin;
