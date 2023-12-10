import type { SugarRushPluginSettings } from "./pluginSettings";

/**
 * Default settings for the SugarRushPlugin.
 */
export const DEFAULT_SETTINGS: SugarRushPluginSettings = {
	debug: false,
	sugarFolder: "Sugar",
	hideSugarFolder: false,
	showRibbonIcon: true,
	showHiddenFiles: true,
	showFileSize: false,
	showFileModifiedTime: false,
	showFileCreatedTime: false,
};
