import { type Editor, TAbstractFile, TFile, TFolder, Notice } from "obsidian";
import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	private readonly plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.plugin.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush to Sugar View",
			editorCheckCallback: (checking: boolean) => {
				const activeFile = plugin.app.workspace.getActiveFile();
				if (checking) {
					if (activeFile) {
						return true;
					}
					return false;
				}
				const leaf = plugin.app.workspace.getMostRecentLeaf();
				if (activeFile && leaf) {
					const sugarFilePath =
						plugin.fileSystemHandler.getSugarFilePath(activeFile);
					if (activeFile.parent && activeFile.parent.name !== "") {
						const file: TFile | null | undefined | TAbstractFile =
							plugin.app.vault.getAbstractFileByPath(sugarFilePath);
						if (!file) {
							plugin.fileSystemHandler
								.createSugarFile(activeFile)
								.then((file: TFile) => {
									plugin.fileSystemHandler.loadFile(file, leaf);
								});
						} else {
							if (file instanceof TFile) {
								plugin.fileSystemHandler.loadFile(file, leaf);
							}
						}
					} else {
						const file: TFile | null | undefined | TAbstractFile =
							plugin.app.vault.getAbstractFileByPath(sugarFilePath);
						if (!file) {
							plugin.fileSystemHandler
								.createSugarFile(activeFile)
								.then((file: TFile) => {
									plugin.fileSystemHandler.loadFile(file, leaf);
								});
						} else {
							if (file instanceof TFile) {
								plugin.fileSystemHandler.loadFile(file, leaf);
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
		});
		this.plugin.addCommand({
			id: "toggle-hidden-files",
			name: "Toggle Hidden Files",
			editorCheckCallback: (checking: boolean) => {
				if (checking) {
					const activeFile = plugin.app.workspace.getActiveFile();
					if (!activeFile) {
						return false;
					}
					if (activeFile.extension !== "sugar") {
						return false;
					}
					return true;
				}
				if (plugin.fileSystemHandler.operationsMap.size > 0) {
					new Notice("Cannot toggle hidden files while an operation is in progress.");
				}
				plugin.settings.showHiddenFiles = !plugin.settings.showHiddenFiles;
				plugin.saveSettings();
				return true;
			}
		});
		this.plugin.addCommand({
			id: "select-sugar-view-entry",
			name: "Select Sugar View Entry",
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				const activeFile = plugin.app.workspace.getActiveFile();
				const leaf = plugin.app.workspace.getMostRecentLeaf();
				if (checking) {
					return true;
				}
				if (activeFile && activeFile.extension === "sugar") {
					const id = editor.getLine(editor.getCursor().line).split("<a href=")[1].split(">")[0];
					const file = plugin.fileSystemHandler.abstractMap.get(parseInt(id));
					if (!file || !leaf) {
						return false;
					}
					if (file instanceof TFile) {
						if (plugin.settings.debug) {
							console.log(`commandSelectSugarViewEntry.ts: selecting and opening TFile: ${file.path}`);
						}
						plugin.fileSystemHandler.loadFile(file, leaf);
					}
					if (file instanceof TFolder) {
						if (plugin.settings.debug) {
							console.log(`commandSelectSugarViewEntry.ts: selecting and opening TFolder: ${file.path}`);
						}
					}

					return true;
				}
				if (plugin.settings.debug) {
					console.log("commandSelectSugarViewEntry.ts: not selecting anything | checking is ");
				}
				return false;
			}
		});
		this.plugin.addCommand({
			id: "save-sugar-view",
			name: "Save Sugar View",
			editorCheckCallback: (checking: boolean) => {
				const activeFile = plugin.app.workspace.getActiveFile();
				const leaf = plugin.app.workspace.getMostRecentLeaf();
				if (!checking && activeFile && leaf) {
					plugin.app.vault
						.modify(activeFile, plugin.fileSystemHandler.generateSugarFileContent(activeFile))
						.then(() => {
							if (plugin.settings.debug) {
								console.log("Refreshed file", activeFile);
							}
							plugin.fileSystemHandler.loadFile(activeFile, leaf);
						});
				} else {
					if (activeFile && leaf) {
						return true;
					}
				}
				return true;
			}
		});
		this.plugin.addCommand({
			id: "refresh-sugar-view",
			name: "Refresh Sugar View",
			editorCheckCallback: (checking: boolean) => {
				const activeFile = plugin.app.workspace.getActiveFile();
				const leaf = plugin.app.workspace.getMostRecentLeaf();
				if (!checking && activeFile && leaf) {
					plugin.app.vault
						.modify(activeFile, plugin.fileSystemHandler.generateSugarFileContent(activeFile))
						.then(() => {
							if (plugin.settings.debug) {
								console.log("Refreshed file", activeFile);
							}
							plugin.fileSystemHandler.loadFile(activeFile, leaf);
						});
				} else {
					if (activeFile && leaf) {
						return true;
					}
				}
				return true;
			}
		});
	}
}
