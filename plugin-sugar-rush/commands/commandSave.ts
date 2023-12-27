import { type Command } from "obsidian";
import type SugarRushPlugin from "./../main";

/**
 * The class commandSaveSugarView implements the Command object.
 * @property id - The id of the command.
 * @property name - The name of the command.
 * @property plugin - The instance of the plugin.
 **/
export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
	plugin: SugarRushPlugin;

	/**
	 * Creates a new Save teh sugar view(s) command
	 * @[aram plugin - The instance of the plugin, SUgar Rsuh.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	checkCallback?: (checking: boolean) => boolean | void = (checking: boolean) => {
		if (checking) {
			return this.plugin.operationHandler.operations.length > 0;
		}
		if(!checking){
			this.plugin.fileSystemHandler.openSugarOperationViewModal();
		}
	};
}
