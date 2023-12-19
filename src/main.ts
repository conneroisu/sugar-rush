import { App, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings/sugarSettings";
import { SugarRushSettingTab } from "./settings/settingsPage";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushRibbonHandler from "./handlerRibbon";
import SugarRushFileSystemHandler from "./handlerFileSystem";
import iconGutter from "./extensionIcons";
import type { Extension } from "@codemirror/state";
import SugarRushOperationHandler from "./handlerOperations";
import SugarRushExtensionHandler from "./handlerExtensions";

export default class SugarRushPlugin extends Plugin {
	settings!:			SugarRushPluginSettings;
	commandHandler!:	SugarRushCommandHandler;
	ribbonHandler!:		SugarRushRibbonHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	operationHandler!:  SugarRushOperationHandler;
	extensionHandler!:  SugarRushExtensionHandler;
	
	app!: App;
	extension: Extension  = iconGutter();

	async onload() {
		await this.loadSettings();
		// Register the extension for `.sugar` files as markdown.
		this.registerExtensions(["sugar"], "markdown");
		// Add a new Sugar Rush Settings Tab.
		this.addSettingTab(new SugarRushSettingTab(this));
		// Add a new Sugar Rush Command Handler.
		this.commandHandler = new SugarRushCommandHandler(this);
		// Add a new Sugar Rush Ribbon Handler.
		this.ribbonHandler = new SugarRushRibbonHandler(this);
		// Add a new Sugar Rush File System Handler.
		this.fileSystemHandler = new SugarRushFileSystemHandler(this);
		// Add a new Sugar Rush Operation Handler.
		this.operationHandler = new SugarRushOperationHandler(this);
		// Add a new Sugar Rush Extension Handler.
		this.extensionHandler = new SugarRushExtensionHandler(this);
		// Register the extension for `.sugar` files as markdown.
		this.registerEditorExtension(this.extension);
		this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && !this.fileSystemHandler.isSugarFile(file)) {
				this.extension = []
				this.app.workspace.updateOptions();
			}else {
				if (this.fileSystemHandler.operations.length > 0) {
					this.fileSystemHandler.openSugarOperationViewModal();
				}
			}
		});
	}

	/**
	 * Actions taken when unloading the plugin, Sugar-Rush.
	 **/
	onunload() { }

	/**
	 * Loads the plugin settings.
	 **/
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	/**
	 * Saves the plugin settings.
	 **/
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
