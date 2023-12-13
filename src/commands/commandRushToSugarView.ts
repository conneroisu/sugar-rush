import { type Command, type MarkdownFileInfo, MarkdownView, Editor } from "obsidian";
import type SugarRushPlugin from "src/main";

/**
 * Sugar Rush Plugin Command: Rush to Sugar View.
 * @description: This command creates a new Sugar View file for the active file.
 **/
export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;
	id: string = "rush-to-sugar-view";
	name: string = "Rush to Sugar View";

	/**
	 * Creates a new commandRushToSugarView.
	 * @param plugin The SugarRushPlugin that this command is a part of.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback?: ((checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) | undefined = (checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		const leaf = this.plugin.app.workspace.getMostRecentLeaf();
		if (leaf) {
			if (activeFile) {
				if (activeFile.parent && activeFile.parent.name != "") {
					// The file is not at the root and has a parent folder
					const sugarFilePath = this.plugin.fileSystemHandler.getSugarFilePath(activeFile);
					let file = this.plugin.app.vault.getAbstractFileByPath(sugarFilePath);
					if (!file) {
						this.plugin.fileSystemHandler.createSugarFile(activeFile, leaf);
						return true;
					}
				} else {
					// The file is at the root of the vault

				}
			}
		}
		return false;
	}
}

