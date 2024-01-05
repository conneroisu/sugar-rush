import { PluginSettingTab, Setting } from "obsidian";

import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * View for the settings of the plin, SugarRUshPlugin
 * @ext
 **/
export class SugarRushSettingView extends PluginSettingTab {
	plugin: SugarRushPlugin;

	/**
	 * Creates a new setting view.
	 **/
	constructor(plugin: SugarRushPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}


	/**
	 * Displays the settings view.
	 **/
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
					if (this.plugin.settings.debug) {
						el.style.visibility = "visible";
					}else{
						el.style.visibility = "hidden";
					}
					await this.plugin.saveSettings();
				}));

		const el = containerEl.createEl("h2", { text: "Debug Logs" });

		new Setting(containerEl)
			.setName("Show Hidden Files")
			.setDesc("Display hidden files? (Requires a restart to see changes)")
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.showHiddenFiles)
				.onChange(async (value) => {
					this.plugin.settings.showHiddenFiles = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Show File Sizes")
			.setDesc("Display file sizes? (Requires a restart to see changes)")
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.showFileSizes)
				.onChange(async (value) => {
					this.plugin.settings.showFileSizes = value;
					await this.plugin.saveSettings();
				}));

		// sqlite view of the logging table
		// new Setting(containerEl)
		// .setName("Visual Extensions")
		// .setDesc("Display visual extensions?")
		// .add
	}
}
