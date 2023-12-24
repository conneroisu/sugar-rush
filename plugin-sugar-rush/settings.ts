export const DEFAULT_SETTINGS: SugarRushPluginSettings = {
	debug: false,
	showHiddenFiles: true,
	showFileSize: false,
};

export interface SugarRushPluginSettings {
	debug: boolean;
	showHiddenFiles: boolean;
	showFileSize: boolean;
}


