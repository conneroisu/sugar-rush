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
	commandHandler!: SugarRushCommandHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	operationHandler!: SugarRushOperationHandler;
	extensionHandler!: SugarRushExtensionHandler;
	app!: App;

	/**
	 * onLoad Method:
	 * This method is invoked async when the plugin is loaded to the workspace. It performs several initialization tasks:
	 * - Load settings using the loadSettings method.
	 * - Delete all Sugar Files in the file system.
	 * - Register the sugar file extension as markdown.
	 * - Add a new settings tab with a SugarRushSettingsView instance.
	 * - Instantiate commandHandler, fileSystemHandler, operationHandler, and extensionHandler.
	 * - Attach an event handler to the workspace to handle file-opening events. If the opened file is not a sugar file,
	 *   update the workspace options and get sugar file extensions. If it's a sugar file and there are operations in the
	 *   queue, open the SugarOperationView modal.
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
	 * This method is invoked when the plugin is unloaded from the workspace. Its function is to delete all Sugar Files from the file
	 * system. This is achieved by calling the deleteAllSugarFiles method of the fileSystemHandler.
	 **/
	onunload() {
		this.fileSystemHandler.deleteAllSugarFiles();
	}

	/**
	 * loads the settings for the plugin from the storage and merges it with default settings.
	 * This asynchronous method is responsible for loading the settings of the SugarRushPlugin. It takes no parameters.
	 * It employs `Object.assign` to merge the default settings (`DEFAULT_SETTINGS`) with any existing settings retrieved
	 * from the storage via `this.loadData()` method. It then assigns this merged data to the `settings` property of the
	 * SugarRushPlugin instance.
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
