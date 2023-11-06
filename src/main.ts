import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { SugarRushSettingTab } from "./settings/SettingsPage";
import { SugarRushPluginSettings } from "./settings/PluginSettings";
import { DEFAULT_SETTINGS } from "./settings/DefaultSettings";
import { open_sugar_file } from "./utils/OpenSugarFile";

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerExtensions(["sugar"], "markdown");

		this.addRibbonIcon("glass-water", "Sugar Rush", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice("This is a notice!");
		});

		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
			},
		});
		this.addCommand({
			id: "open-sugar-file",
			name: "open sugar file",
			callback: () => {
				open_sugar_file(this);
			},
		});

		this.addSettingTab(new SugarRushSettingTab(this.app, this));
	}

	onunload() {}

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
