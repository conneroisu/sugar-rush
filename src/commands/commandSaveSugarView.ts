
import { type Command } from "obsidian";
import type SugarRushPlugin from "./../main";
import { SugarOperationModal } from "./../views/SugarOperationView";

export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
    plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	checkCallback?: (checking:boolean) => boolean | void = (checking:boolean) => {
		// open the view
		if (checking){
			return true;
		}
		new SugarOperationModal(this.plugin.app).open();
		
	};
}
