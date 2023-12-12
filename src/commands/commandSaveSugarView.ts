
import { Notice, type Command } from "obsidian";
import type SugarRushPlugin from "src/main";

export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
    plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	checkCallback?: () => boolean | void = () => {
		// Check if the current file is a Sugar View
		// If it is, return true
		// Also, check each file in the sugar folder for operations that have been performed on it
	};
}
