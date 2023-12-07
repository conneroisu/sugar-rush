import { App, PluginSettingTab, Setting } from "obsidian";
import SugarRushPlugin from "src/main";

/**
 * Represents the settings page for the Sugar Rush plugin.
 */
export class SugarRushSettingTab extends PluginSettingTab {
	plugin: SugarRushPlugin;

	/**
	 * Creates an instance of SugarRushSettingTab.
	 * @param app The application instance.
	 * @param plugin The Sugar Rush plugin instance.
	 */
	constructor(app: App, plugin: SugarRushPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Displays the settings page.
	 */
	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Show Ribbon Icon")
			.setDesc(
				"Do you want to show the ribbon icon? (A Restart is Required to See Changes)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showRibbonIcon)
					.onChange(async (value) => {
						this.plugin.settings.showRibbonIcon = value;
						await this.plugin.saveSettings();
						if (value) {
							this.plugin.ribbonHandler.addRibbonIcon();
						}
					})
			);

		new Setting(containerEl)
			.setName("Show Hidden Files")
			.setDesc(
				"Do you want to show hidden files? (A Restart is Required to See Changes)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showHiddenFiles)
					.onChange(async (value) => {
						this.plugin.settings.showHiddenFiles = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show File Size")
			.setDesc(
				"Do you want to show file size? (A Restart is Required to See Changes)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showFileSize)
					.onChange(async (value) => {
						this.plugin.settings.showFileSize = value;
						await this.plugin.saveSettings();
					})
			);

	}
}
