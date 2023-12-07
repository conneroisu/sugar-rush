import { type Command } from "obsidian";
import type SugarRushPlugin from "src/main";

export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;
	id: string = "toggle-hidden-files-in-sugar";
	name: string = "Toggle Hidden Files In Sugar Views";

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	checkCallback?: () => boolean | void = () => {
		this.plugin.settings.showHiddenFiles =
			!this.plugin.settings.showHiddenFiles;
	};
}
