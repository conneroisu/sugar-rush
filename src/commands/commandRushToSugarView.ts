import type { assert } from "console";
import { type Command, type MarkdownFileInfo, MarkdownView, Editor, TFile, WorkspaceLeaf } from "obsidian";
import type SugarRushPlugin from "src/main";

/**
 * Sugar Rush Plugin Command: Rush to Sugar View.
 * @description: This command creates a new Sugar View file for the active file.
 **/
export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;
	id: string = "rush-to-sugar-view";
	name: string = "Rush to Sugar View";

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback?: ((checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) | undefined = async (checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		const leaf = this.plugin.app.workspace.getMostRecentLeaf();
		if (leaf) {
			if (activeFile) {
				if (!checking) {
					console.log("Attempting to Rush Sugar View file");
					if (activeFile.parent && activeFile.parent.name != "") {
						// The file is not at the root and has a parent folder
						const sugarFilePath = this.plugin.fileSystemHandler.getSugarFilePath(activeFile);
						console.log("sugarFilePath: " + sugarFilePath);
						let file = this.plugin.app.vault.getAbstractFileByPath(sugarFilePath);
						console.log("file: " + file);
						if (!file) {
							console.log("file does not exist");
							this.plugin.fileSystemHandler.createSugarFile(activeFile, leaf);
							return true;
						}

						const rfile = file;
						if (rfile instanceof TFile) {
							leaf.openFile(rfile);
						}
					} else {
						// The file is at the root of the vault
						console.log("file is at root");

					}
				}
				return true;
			}
		}
		console.log("editorCheckCallback: false");
		console.log("checking: " + checking);
		return false;
	}
}

