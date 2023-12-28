import { Notice } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Toggles the display of hidden files in the file explorer.
 * @param {SugarRushPlugin} plugin - An instance of SugarRushPlugin.
 * @param {boolean} checking - If true, then we are checking if the command can be run.
 * @returns {boolean} - Returns true if the command can be run.
 **/
export default function commandToggleHiddenFiles(plugin: SugarRushPlugin, checking: boolean): boolean {
	// If checking is true, then we are checking if the command can be run.
	if (checking) {
		const activeFile = plugin.app.workspace.getActiveFile();
		if (!activeFile) { return false; }
		if (!plugin.fileSystemHandler.isSugarFile(activeFile)) {
			return false;
		}
		return true;
	}
	if (plugin.fileSystemHandler.operations.size > 0) {
		new Notice("Cannot toggle hidden files while an operation is in progress.");
	}
	plugin.settings.showHiddenFiles = !plugin.settings.showHiddenFiles;
	plugin.saveSettings();
	return true;
}
