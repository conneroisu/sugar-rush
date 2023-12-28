import { TAbstractFile, TFile } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export default function RushToSugarViewCommand(plugin: SugarRushPlugin) {
	const activeFile = plugin.app.workspace.getActiveFile();
	const leaf = plugin.app.workspace.getMostRecentLeaf();
	if (activeFile && leaf) {
		const sugarFilePath =
			plugin.fileSystemHandler.getSugarFilePath(activeFile);
		if (activeFile.parent && activeFile.parent.name != "") {
			// The file is not at the root and has a parent folder
			const file: TFile | null | undefined | TAbstractFile =
				plugin.app.vault.getAbstractFileByPath(sugarFilePath);
			if (!file) {
				plugin.fileSystemHandler
					.createSugarFile(activeFile)
					.then((file: TFile) => {
						plugin.fileSystemHandler.loadSugarFile(file, leaf);
					});
			} else {
				if (file instanceof TFile) {
					plugin.fileSystemHandler.loadSugarFile(file, leaf);
				}
			}
		} else {
			const file: TFile | null | undefined | TAbstractFile =
				plugin.app.vault.getAbstractFileByPath(sugarFilePath);
			if (!file) {
				plugin.fileSystemHandler
					.createSugarFile(activeFile)
					.then((file: TFile) => {
						plugin.fileSystemHandler.loadSugarFile(file, leaf);
					});
			} else {
				if (file instanceof TFile) {
					plugin.fileSystemHandler.loadSugarFile(file, leaf);
				}
			}
		}
	} else {
		if (activeFile && leaf) {
			return true;
		}
	}
	return true;
}
