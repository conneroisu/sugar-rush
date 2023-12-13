import { App, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings/sugarSettings";
import { SugarRushSettingTab } from "./settings/settingsPage";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushRibbonHandler from "./handlerRibbon";
import SugarRushIntervalHandler from "./handlerIntervals";
import SugarRushFileSystemHandler from "./handlerFileSystem";
import SugarRushIconHandler from "./handlerIcons";
import { lineNumbersRelative } from "./extension";

/**
 * Sugar Rush Plugin for Obsidian.
 * contributors: @conneroisu
 **/
export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	ribbonHandler!: SugarRushRibbonHandler;
	intervalHandler!: SugarRushIntervalHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	iconHandler!: SugarRushIconHandler;
	app!: App;

	/**
	 * Loads the Sugar Rush Plugin.
	 */
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
		// Add a new Sugar Rush Interval Handler.
		this.intervalHandler = new SugarRushIntervalHandler(this);
		// Add a new Sugar Rush File System Handler.
		this.fileSystemHandler = new SugarRushFileSystemHandler(this);
		// Add a new Sugar Rush Icon Handler.
		this.iconHandler = new SugarRushIconHandler(this);

		// Add the application reference.
		this.app = this.app;
		// Delete the Sugar Folder on Load.
		this.fileSystemHandler.deleteSugarFolder();
	}

	activateIconExtension() {
		this.registerEditorExtension(lineNumbersRelative());
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
