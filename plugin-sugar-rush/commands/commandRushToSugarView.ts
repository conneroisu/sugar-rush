import {
	type Command,
	TFile,
	TAbstractFile,
} from "obsidian";
import type SugarRushPlugin from "../main";

export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;
	id: string = "rush-to-sugar-view";
	name: string = "Rush to Sugar View";

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback?: | ((checking: boolean) => boolean | void) | undefined = (checking: boolean) => {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		const leaf = this.plugin.app.workspace.getMostRecentLeaf();
		if (!checking && activeFile && leaf) {
			const sugarFilePath =
				this.plugin.fileSystemHandler.getSugarFilePath(activeFile);
			if (activeFile.parent && activeFile.parent.name != "") {
				// The file is not at the root and has a parent folder
				const file: TFile | null | undefined | TAbstractFile =
					this.plugin.app.vault.getAbstractFileByPath(sugarFilePath);
				if (!file) {
					this.plugin.fileSystemHandler
						.createSugarFile(activeFile)
						.then((file) => {
							this.plugin.fileSystemHandler.loadSugarFile(
								file,
								leaf
							);
						});
				} else {
					if (file instanceof TFile) {
						this.plugin.fileSystemHandler.loadSugarFile(file, leaf);
					}
				}
			} else {
				const file: TFile | null | undefined | TAbstractFile =
					this.plugin.app.vault.getAbstractFileByPath(sugarFilePath);
				if (!file) {
					this.plugin.fileSystemHandler
						.createSugarFile(activeFile)
						.then((file) => {
							this.plugin.fileSystemHandler.loadSugarFile(
								file,
								leaf
							);
						});
				} else {
					if (file instanceof TFile) {
						this.plugin.fileSystemHandler.loadSugarFile(file, leaf);
					}
				}
			}
		} else {
			if (activeFile && leaf) {
				return true;
			}
		}
		return true;
	};
}
