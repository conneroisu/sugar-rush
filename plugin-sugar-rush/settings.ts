import { PluginSettingTab, Setting } from "obsidian";
import type SugarRushPlugin from "./main";

export const DEFAULT_SETTINGS: SugarRushPluginSettings = {
	debug: false,
	showHiddenFiles: true,
	showFileSize: false,
	showFileModifiedTime: false,
	showFileCreatedTime: false,
};

export interface SugarRushPluginSettings {
	debug: boolean;
	showHiddenFiles: boolean;
	showFileSize: boolean;
	showFileModifiedTime: boolean;
	showFileCreatedTime: boolean;
}


export class SugarRushSettingTab extends PluginSettingTab {
	plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Debug Mode")
			.setDesc("debug mode?")
			.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.debug)
					.onChange(async (value) => {
						this.plugin.settings.debug = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName("Show Hidden Files")
			.setDesc("Display hidden files?")
			.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.showHiddenFiles)
					.onChange(async (value) => {
						this.plugin.settings.showHiddenFiles = value;
						await this.plugin.saveSettings();
					}));
		
		new Setting(containerEl)
			.setName("Show File Size")
			.setDesc("Do you want to show file size?")
			.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.showFileSize)
					.onChange(async (value) => {
						this.plugin.settings.showFileSize = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName("Show File Modified Time")
			.setDesc("Do you want to show file modified time?")
			.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.showFileModifiedTime)
					.onChange(async (value) => {
						this.plugin.settings.showFileModifiedTime = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName("Show File Created Time")
			.setDesc("Do you want to show file created time?")
			.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.showFileCreatedTime)
					.onChange(async (value) => {
						this.plugin.settings.showFileCreatedTime = value;
						await this.plugin.saveSettings();
					}));
	}
}
