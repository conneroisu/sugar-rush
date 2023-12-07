import { Plugin } from "obsidian";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushRibbonHandler from "./handlerRibbon";
import { SugarRushSettingTab } from "./settings/SettingsPage";
import { DEFAULT_SETTINGS } from "./settings/DefaultSettings";
import type { SugarRushPluginSettings } from "./settings/PluginSettings";

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	ribbonHandler!: SugarRushRibbonHandler;

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

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
