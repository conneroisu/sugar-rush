import { Plugin } from "obsidian";
import type { SugarRushPluginSettings } from "./settings/PluginSettings";
import { SugarRushSettingTab } from "./settings/SettingsPage";
import { DEFAULT_SETTINGS } from "./settings/DefaultSettings";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushRibbonHandler from "./handlerRibbon";

/**
 * Represents the main class of the Plugin, Sugar-Rush.
 * This class extends the Plugin class and provides functionality for loading settings,
 * registering extensions, adding command and ribbon handlers, and managing settings tabs.
 **/
export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	ribbonHandler!: SugarRushRibbonHandler;

	/**
	 * Loads the plugin settings, registers extensions, adds command and ribbon handlers,
	 * and adds the settings tab for the Sugar-Rush plugin.
	 */
	async onload() {
		// Load the settings
		await this.loadSettings();
		// Add the extension for `.sugar` files
		this.registerExtensions(["sugar"], "markdown");
		// Add the commandHandler
		this.commandHandler = new SugarRushCommandHandler(this);
		// Add the ribbonHandler
		this.ribbonHandler = new SugarRushRibbonHandler(this);
		// Add the settings tab
		this.addSettingTab(new SugarRushSettingTab(this.app, this));
	}

	/**
	 * Actions taken when unloading the plugin, Sugar-Rush.
	 **/
	onunload() {}

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
