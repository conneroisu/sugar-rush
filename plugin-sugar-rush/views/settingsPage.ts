import { PluginSettingTab, Setting } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

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
		// new Setting(containerEl)
		// .setName("Visual Extensions")
		// .setDesc("Display visual extensions?")
		// .add
	}
}
