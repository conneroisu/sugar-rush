
import { Notice, type Command } from "obsidian";
import type SugarRushPlugin from "src/main";

export default class commandRefreshSugarView implements Command {
	plugin!: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	id: string = "refresh-sugar-view";
	name: string = "Refresh Sugar View";
	checkCallback?: () => boolean | void = () => {
		// Check if there is a current file
		new Notice("This is a notice!");
	};
}
