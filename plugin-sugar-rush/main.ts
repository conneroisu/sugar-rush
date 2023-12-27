import { App, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings";
import { SugarRushSettingView } from "./views/viewSettings";
import SugarRushCommandHandler from "./handlers/handlerCommands";
import SugarRushFileSystemHandler from "./handlers/handlerFileSystem";
import SugarRushOperationHandler from "./handlers/handlerOperations";
import SugarRushExtensionHandler from "./handlers/handlerExtensions";

/**
 * The `SugarRushPlugin` class extends the `Plugin` base class to provide functionality related to handling sugar files in the Obsidian app.
 * @attribute {SugarRushPluginSettings} settings - holds the settings for the plugin.
 * @attribute {SugarRushCommandHandler} commandHandler - manages command related operations for the plugin.
 * @attribute {SugarRushFileSystemHandler} fileSystemHandler - manages filesystem related operations for sugar files.
 * @attribute {SugarRushOperationHandler} operationHandler - manages operations for the plugin.
 * @attrubute {SugarRushExtensionHandler} extensionHandler - manages extension related operations for the plugin.
 * @attribute {App} app - instance of the App class from Obsidian API.
 * @method {async loadSettings} - loads the settings for the plugin from the storage and merges it with default settings.
 * @method {async saveSettings} - saves the settings for the plugin to the storage.
 * @method {onload} - this method is run when the plugin is loaded. It initialization events for extensions, settings tab, and handlers.
 * @method {onunload} - this method is run when the plugin is unloaded. It deletes all sugar files with the help of file system handler.
 * @method {loadSettings} - this method loads the settings for the plugin from the storage and merges it with default settings.
 * @method {saveSettings} - this method saves the settings for the plugin to the storage.
 **/

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	operationHandler!: SugarRushOperationHandler;
	extensionHandler!: SugarRushExtensionHandler;
	app!: App;

	/**
	 * Asyncronously invokes when the plugin is loaded to the workspace.
	 **/
	async onload() {
		await this.loadSettings();
		this.registerExtensions(["sugar"], "markdown");
		this.addSettingTab(new SugarRushSettingView(this));
		this.commandHandler = new SugarRushCommandHandler(this);
		this.fileSystemHandler = new SugarRushFileSystemHandler(this);
		this.fileSystemHandler.deleteAllSugarFiles();
		this.operationHandler = new SugarRushOperationHandler(this);
		this.extensionHandler = new SugarRushExtensionHandler(this);
		this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && !this.fileSystemHandler.isSugarFile(file)) {
				this.extensionHandler.getExtensions();
				this.app.workspace.updateOptions();
			} else {
				if (this.operationHandler.operations.length > 0) {
					this.fileSystemHandler.openSugarOperationViewModal();
				}
			}
		});
	}

	/**
	 * Unloads the plugin, sugar-rush, from the workspace.
	 **/
	onunload() {
		this.fileSystemHandler.deleteAllSugarFiles();
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
	 * It uses the saveData method to save the current state of settings into the storage.
	 **/

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
