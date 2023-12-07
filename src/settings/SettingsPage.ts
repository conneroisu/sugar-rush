import { App, PluginSettingTab, Setting } from "obsidian";
import SugarRushPlugin from "src/main";

export class SugarRushSettingTab extends PluginSettingTab {
	plugin: SugarRushPlugin;

	constructor(app: App, plugin: SugarRushPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show Ribbon Icon")
			.setDesc("Do you want to show the ribbon icon? (A Restart is Required to See Changes)")
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
			.setDesc("Do you want to show hidden files? (A Restart is Required to See Changes)")
			.addToggle((toggle) => 
				toggle 
					.setValue(this.plugin.settings.showHiddenFiles)
					.onChange(async (value) => {
						this.plugin.settings.showHiddenFiles = value;
						await this.plugin.saveSettings();
					})
		);
	}
}
