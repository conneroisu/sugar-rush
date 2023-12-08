import { Notice, type Command } from "obsidian";
import type SugarRushPlugin from "src/main";

export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	id: string = "rush-to-sugar-view";
	name: string = "Rush To Sugar View";
	checkCallback?: () => boolean | void = () => {
		// Check if there is a current file
		new Notice("This is a notice!");
		// Check if the extension of the current file is .sugar
	};
}
