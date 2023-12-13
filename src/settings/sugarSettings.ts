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

/**
 * Represents the settings for the Sugar Rush plugin.
 */
export interface SugarRushPluginSettings {
	debug: boolean;
	sugarFolder: string;
	hideSugarFolder: boolean;
	showRibbonIcon: boolean;
	showHiddenFiles: boolean;
	showFileSize: boolean;
	showFileModifiedTime: boolean;
	showFileCreatedTime: boolean;
}
