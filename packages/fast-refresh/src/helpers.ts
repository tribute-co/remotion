// @ts-expect-error
import RefreshRuntime from 'react-refresh/runtime';

declare const module: {
	hot: {
		status: () =>
			| 'idle'
			| 'check'
			| 'prepare'
			| 'ready'
			| 'dispose'
			| 'apply'
			| 'abort'
			| 'fail';
	};
};

function isSafeExport(key: string): boolean {
	return (
		key === '__esModule' ||
		key === '__N_SSG' ||
		key === '__N_SSP' ||
		// TODO: remove this key from page config instead of allow listing it
		key === 'config'
	);
}

function registerExportsForReactRefresh(
	moduleExports: unknown,
	moduleID: string
) {
	RefreshRuntime.register(moduleExports, moduleID + ' %exports%');
	if (moduleExports == null || typeof moduleExports !== 'object') {
		// Exit if we can't iterate over exports.
		// (This is important for legacy environments.)
		return;
	}
	for (const key in moduleExports) {
		if (isSafeExport(key)) {
			continue;
		}
		const exportValue = moduleExports[key];
		const typeID = moduleID + ' %exports% ' + key;
		RefreshRuntime.register(exportValue, typeID);
	}
}

function isReactRefreshBoundary(moduleExports: unknown): boolean {
	if (RefreshRuntime.isLikelyComponentType(moduleExports)) {
		return true;
	}
	if (moduleExports == null || typeof moduleExports !== 'object') {
		// Exit if we can't iterate over exports.
		return false;
	}
	let hasExports = false;
	let areAllExportsComponents = true;
	for (const key in moduleExports) {
		hasExports = true;
		if (isSafeExport(key)) {
			continue;
		}
		const exportValue = moduleExports[key];
		if (!RefreshRuntime.isLikelyComponentType(exportValue)) {
			areAllExportsComponents = false;
		}
	}
	return hasExports && areAllExportsComponents;
}

function shouldInvalidateReactRefreshBoundary(
	prevExports: unknown,
	nextExports: unknown
): boolean {
	const prevSignature = getRefreshBoundarySignature(prevExports);
	const nextSignature = getRefreshBoundarySignature(nextExports);
	if (prevSignature.length !== nextSignature.length) {
		return true;
	}
	for (let i = 0; i < nextSignature.length; i++) {
		if (prevSignature[i] !== nextSignature[i]) {
			return true;
		}
	}
	return false;
}

function getRefreshBoundarySignature(moduleExports: unknown): Array<unknown> {
	const signature = [];
	signature.push(RefreshRuntime.getFamilyByType(moduleExports));
	if (moduleExports == null || typeof moduleExports !== 'object') {
		// Exit if we can't iterate over exports.
		// (This is important for legacy environments.)
		return signature;
	}
	for (const key in moduleExports) {
		if (isSafeExport(key)) {
			continue;
		}
		const exportValue = moduleExports[key];
		signature.push(key);
		signature.push(RefreshRuntime.getFamilyByType(exportValue));
	}
	return signature;
}

let isUpdateScheduled = false;
function scheduleUpdate() {
	if (isUpdateScheduled) {
		return;
	}

	function canApplyUpdate() {
		return module.hot.status() === 'idle';
	}

	isUpdateScheduled = true;
	setTimeout(() => {
		isUpdateScheduled = false;

		// Only trigger refresh if the webpack HMR state is idle
		if (canApplyUpdate()) {
			try {
				RefreshRuntime.performReactRefresh();
			} catch (err) {
				console.warn(
					'Warning: Failed to re-render. We will retry on the next Fast Refresh event.\n' +
						err
				);
			}
			return;
		}

		return scheduleUpdate();
	}, 30);
}

// Needs to be compatible with IE11
export default {
	registerExportsForReactRefresh,
	isReactRefreshBoundary,
	shouldInvalidateReactRefreshBoundary,
	getRefreshBoundarySignature,
	scheduleUpdate,
};
