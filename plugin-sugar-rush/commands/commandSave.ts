
import SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Saves the current file view as a Sugar file opening a modal to executeaccmulated operations
 * @param {SugarRushPlugin} plugin - The plugin instance
 * @param {boolean} checking - Whether or not the command is checking if it can be run
 * @returns {boolean} - Whether or not the command can be run
 **/
export default function commandSaveSugarView(plugin: SugarRushPlugin, checking: boolean): boolean | undefined {
	if (checking) {
		return plugin.fileSystemHandler.operations.size > 0;
	}
	if (!checking) {
		plugin.fileSystemHandler.openSugarOperationViewModal();
	}
	return undefined;
}
