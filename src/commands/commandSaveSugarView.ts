import { type Command } from "obsidian";
import type SugarRushPlugin from "./../main";

/**
 * commandSaveSugarView: saves the current sugar view
 * @param plugin the Sugar Rush Plugin that this command is associated with
 **/
export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
	plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	checkCallback?: (checking: boolean) => boolean | void = (checking: boolean) => {
		if (checking) {
			return this.plugin.fileSystemHandler.areOperationsAvailable();
		}
		if(!checking){
			this.plugin.fileSystemHandler.openSugarOperationViewModal();
		}
	};
}
