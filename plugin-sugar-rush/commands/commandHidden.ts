import { type Command } from "obsidian";
import type SugarRushPlugin from "../main";

export default class commandToggleHiddenFiles implements Command {
	plugin!: SugarRushPlugin;
	id: string = "toggle-hidden-files-in-sugar";
	name: string = "Toggle Hidden Files In Sugar Views";

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback: (checking: boolean) => boolean | void = () => {
		this.plugin.settings.showHiddenFiles = !this.plugin.settings.showHiddenFiles;
		this.plugin.saveSettings();
	};
}
