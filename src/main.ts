import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { SugarRushSettingTab } from "./settings/SettingsPage";
import { SugarRushPluginSettings } from "./settings/PluginSettings";
import { DEFAULT_SETTINGS } from "./settings/DefaultSettings";
import SugarRushCommandHandler from "./commandHandler";
import SugarRushRibbonHandler from "./ribbonHandler";

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	ribbonHandler!: SugarRushRibbonHandler;

	async onload() {
		await this.loadSettings();
		this.registerExtensions(["sugar"], "markdown");
		this.commandHandler = new SugarRushCommandHandler(this);
		this.ribbonHandler = new SugarRushRibbonHandler(this);
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
