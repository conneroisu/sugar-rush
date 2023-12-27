
/**
 * `DEFAULT_SETTINGS` is a constant object that defines the default settings for the SugarRush plugin.
 * Each property corresponds to a configuration setting.
 * @const DEFAULT_SETTINGS : SugarRushPluginSettings
 * @property {boolean} debug - Default value for debug mode is 'false'.
 * @property {boolean} showHiddenFiles - Default value to show hidden files in the file explorer is 'true'.
 * @property {boolean} showFileIcons - Default value to show file icons in the file explorer is 'true'.
 * @property {boolean} showFileSizes - Default value to show file sizes in the file explorer is 'false'.
 * @property {boolean} showModifiedTimes - Default value to show file modification dates/times in the
 * file explorer is 'false'.
 **/
export const DEFAULT_SETTINGS: SugarRushPluginSettings = {
	debug: false,
	showHiddenFiles: true,
	showFileIcons: true,
	showFileSizes: false,
	showModifiedTimes: false,
};

/**
 * An interface representing the settings for the SugarRush plugin.
 * @interface SugarRushPluginSettings
 * @property {boolean} debug - Represents whether debug mode is activated or not.
 * @property {boolean} showHiddenFiles - Represents whether to show hidden files in the file explorer or not.
 * @property {boolean} showFileIcons - Represents whether to show file icons in the file explorer or not.
 * @property {boolean} showFileSizes - Represents whether to show file sizes in the file explorer or not.
 * @property {boolean} showModifiedTimes - Represents whether to show file modification dates/times in the file explorer or not.
 **/
export interface SugarRushPluginSettings {
	debug: boolean;
	showHiddenFiles: boolean;
	showFileIcons: boolean;
	showFileSizes: boolean;
	showModifiedTimes: boolean;
}
