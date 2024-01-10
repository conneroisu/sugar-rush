import { App, Plugin, TFile } from "obsidian";
import SugarRushExtensionHandler from "./handlerExtensions";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushFileSystemHandler from "./handlerFileSystem";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings";
import { SugarRushOperationView } from "./viewOperation";
import { SugarRushSettingView } from "./viewSettings";

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
	commandHandler!: SugarRushCommandHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	extensionHandler!: SugarRushExtensionHandler;
	app!: App;

	/**
	 * Asyncronous routine when the plugin is loaded to the workspace.
	 **/
	async onload() {
		await this.loadSettings();
		this.registerExtensions(["sugar"], "markdown");
		this.addSettingTab(new SugarRushSettingView(this));
		this.commandHandler = new SugarRushCommandHandler(this);
		this.fileSystemHandler = new SugarRushFileSystemHandler(this);
		this.extensionHandler = new SugarRushExtensionHandler(this);
		this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && !(file.extension === "sugar")) {
				this.extensionHandler.getExtensions();
				this.app.workspace.updateOptions();
			} else {
				if (this.fileSystemHandler.operationsMap.size > 0) {
					new SugarRushOperationView(this).open();
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
	}
}
