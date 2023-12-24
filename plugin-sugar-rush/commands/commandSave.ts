import { type Command } from "obsidian";
import type SugarRushPlugin from "./../main";

export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
	plugin: SugarRushPlugin;

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
