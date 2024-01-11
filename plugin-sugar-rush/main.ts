import {
	App,
	Editor,
	Notice,
	Plugin,
	TAbstractFile,
	TFile,
	TFolder,
} from "obsidian";
import SugarRushFileSystemHandler from "./handlerFileSystem";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings";
import { SugarRushOperationView } from "./viewOperation";
import { SugarRushSettingView } from "./viewSettings";
import { type Extension } from "@codemirror/state";
import FormatExtension from "plugin-sugar-rush/extensions/formatExtension";
import SizeExtension from "plugin-sugar-rush/extensions/sizeExtension";

/**
 * The `SugarRushPlugin` class extends the `Plugin` base class to provide functionality related to handling sugar files in the Obsidian app.
 *
 * @attribute {SugarRushPluginSettings} settings - holds the settings for the plugin.
 * @attribute {SugarRushCommandHandler} commandHandler - manages command related operations for the plugin.
 * @attribute {SugarRushFileSystemHandler} fileSystemHandler - manages filesystem related operations for sugar files.
 * @attribute {SugarRushOperationHandler} operationHandler - manages operations for the plugin.
 * @attrubute {SugarRushExtensionHandler} extensionHandler - manages extension related operations for the plugin.
 * @attribute {App} app - instance of the App class from Obsidian API.
 *
 * @method {async loadSettings} - loads the settings for the plugin from the storage and merges it with default settings.
 * @method {async saveSettings} - saves the settings for the plugin to the storage.
 * @method {onload} - this method is run when the plugin is loaded. It initialization events for extensions, settings tab, and handlers.
 * @method {onunload} - this method is run when the plugin is unloaded. It deletes all sugar files with the help of file system handler.
 * @method {loadSettings} - this method loads the settings for the plugin from the storage and merges it with default settings.
 * @method {saveSettings} - this method saves the settings for the plugin to the storage.
 **/
export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	fileSystemHandler!: SugarRushFileSystemHandler;
	extensions!: Extension[];
	app!: App;

	/**
	 * Asyncronous routine when the plugin is loaded to the workspace.
	 **/
	async onload() {
		await this.loadSettings(); // Load settings
		this.registerExtensions(["sugar"], "markdown"); // Register extensions
		this.addSettingTab(new SugarRushSettingView(this)); // Add the settings tab
		this.fileSystemHandler = new SugarRushFileSystemHandler(this); // Initialize file system handler
		this.addCommands(); // Add commands
		this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && !(file.extension === "sugar")) {
				this.getExtensions(); // Update extensions
				this.app.workspace.updateOptions(); // Update workspace options
			} else {
				if (this.fileSystemHandler.operationsMap.size > 0) {
					new SugarRushOperationView(this).open(); // Open operation view
				}
			}
		});
	}

	/**
	 * Unloads the plugin, sugar-rush, from the workspace.
	 **/
	onunload() {
		this.fileSystemHandler.removeAllSugarFiles();
	}

	/**
	 * Asynchronously loads the settings for the plugin from the storage and merges it with default settings.
	 **/
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	/**
	 * saveSettings Method:
	 * This asynchronous method is responsible for saving the settings of the SugarRushPlugin. It takes no parameters.
	 **/
	async saveSettings() {
		await this.saveData(this.settings);
		this.extensions = this.getExtensions();
		this.registerEditorExtension([this.extensions]);
		this.clearExtensions();
	}

	/**
	 * Clears the extensions array
	 **/
	clearExtensions() {
		this.extensions = [];
	}

	/**
	 * Gets all of the extensions active for the plugin.
	 **/
	getExtensions() {
		this.extensions = [];
		if (this.settings.showFileIcons) {
			this.extensions.push(new FormatExtension());
		}
		if (this.settings.showFileSizes) {
			this.extensions.push(new SizeExtension(this));
		}
		return this.extensions;
	}

	/**
	 * Adds all the commands of the Plugin, SugarRushPlugin.
	 **/
	addCommands() {
		this.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush to Sugar View",
			editorCallback: () => {
				const [activeFile, leaf] = [
					this.app.workspace.getActiveFile(), // Get the active file
					this.app.workspace.getMostRecentLeaf(), // Get the most recent leaf
				];
				if (activeFile && leaf) {
					const sugarFilePath =
						this.fileSystemHandler.getSugarFilePath(activeFile);
					if (activeFile.parent && activeFile.parent.name !== "") {
						const file: TFile | null | undefined | TAbstractFile =
							this.app.vault.getAbstractFileByPath(sugarFilePath);
						if (!file) {
							this.fileSystemHandler
								.createSugarFile(activeFile)
								.then((file: TFile) => {
									this.fileSystemHandler.loadFile(file, leaf);
								});
						} else {
							if (file instanceof TFile) {
								this.fileSystemHandler.loadFile(file, leaf);
							}
						}
					} else {
						const file: TFile | null | undefined | TAbstractFile =
							this.app.vault.getAbstractFileByPath(sugarFilePath);
						if (!file) {
							this.fileSystemHandler
								.createSugarFile(activeFile)
								.then((file: TFile) => {
									this.fileSystemHandler.loadFile(file, leaf);
								});
						} else {
							if (file instanceof TFile) {
								this.fileSystemHandler.loadFile(file, leaf);
							}
						}
					}
				} else {
					if (activeFile && leaf) {
						return true;
					}
				}
				return true;
			},
		});
		this.addCommand({
			id: "toggle-hidden-files",
			name: "Toggle Hidden Files",
			editorCheckCallback: (checking: boolean) => {
				if (checking) {
					const activeFile = this.app.workspace.getActiveFile();
					if (!activeFile) {
						return false;
					}
					if (activeFile.extension !== "sugar") {
						return false;
					}
					return true;
				}
				if (this.fileSystemHandler.operationsMap.size > 0) {
					new Notice(
						"Cannot toggle hidden files while an operation is in progress."
					);
				}
				this.settings.showHiddenFiles = !this.settings.showHiddenFiles;
				this.saveSettings();
				return true;
			},
		});
		this.addCommand({
			id: "select-sugar-view-entry",
			name: "Select Sugar View Entry",
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				const activeFile = this.app.workspace.getActiveFile();
				const leaf = this.app.workspace.getMostRecentLeaf();
				if (checking) {
					return true;
				}
				if (activeFile && activeFile.extension === "sugar") {
					const id = editor
						.getLine(editor.getCursor().line)
						.split("<a href=")[1]
						.split(">")[0];
					const file = this.fileSystemHandler.abstractMap.get(
						parseInt(id)
					);
					if (!file || !leaf) {
						return false;
					}
					if (file instanceof TFile) {
						if (this.settings.debug) {
							console.log(
								`commandSelectSugarViewEntry.ts: selecting and opening TFile: ${file.path}`
							);
						}
						this.fileSystemHandler.loadFile(file, leaf);
					}
					if (file instanceof TFolder) {
						if (this.settings.debug) {
							console.log(
								`commandSelectSugarViewEntry.ts: selecting and opening TFolder: ${file.path}`
							);
						}
					}

					return true;
				}
				if (this.settings.debug) {
					console.log(
						"commandSelectSugarViewEntry.ts: not selecting anything | checking is "
					);
				}
				return false;
			},
		});
		this.addCommand({
			id: "save-sugar-view",
			name: "Save Sugar View",
			editorCheckCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				const leaf = this.app.workspace.getMostRecentLeaf();
				if (!checking && activeFile && leaf) {
					this.app.vault
						.modify(
							activeFile,
							this.fileSystemHandler.generateSugarFileContent(
								activeFile
							)
						)
						.then(() => {
							if (this.settings.debug) {
								console.log("Refreshed file", activeFile);
							}
							this.fileSystemHandler.loadFile(activeFile, leaf);
						});
				}
			},
		});
		this.addCommand({
			id: "refresh-sugar-view",
			name: "Refresh Sugar View",
			editorCheckCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				const leaf = this.app.workspace.getMostRecentLeaf();
				if (!checking && activeFile && leaf && activeFile.extension === "sugar") {
					this.app.vault
						.modify(
							activeFile,
							this.fileSystemHandler.generateSugarFileContent(
								activeFile
							)
						)
						.then(() => {
							if (this.settings.debug) {
								console.log("Refreshed file", activeFile);
							}
							this.fileSystemHandler.loadFile(activeFile, leaf);
						});
				} else {
					if (activeFile && leaf) {
						return true;
					}
				}
				return true;
			},
		});
	}
}
