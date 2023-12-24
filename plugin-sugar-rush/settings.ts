export const DEFAULT_SETTINGS: SugarRushPluginSettings = {
	debug: false,
	showHiddenFiles: true,
	showFileIcons: true,
	showFileSizes: false,
	showModifiedTimes: false,
};

export interface SugarRushPluginSettings {
	debug: boolean;
	showHiddenFiles: boolean;
	showFileIcons: boolean;
	showFileSizes: boolean;
	showModifiedTimes: boolean;
}
