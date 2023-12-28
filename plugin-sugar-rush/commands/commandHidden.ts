import { Notice } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export default function commandToggleHiddenFiles(plugin: SugarRushPlugin, checking: boolean) {
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
}
