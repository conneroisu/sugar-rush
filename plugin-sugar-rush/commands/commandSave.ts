import { type Command } from "obsidian";
import type SugarRushPlugin from "./../main";

/**
 * The class commandSaveSugarView implements the Command object.
 *
 * Properties of the class include:
 * id: "sugar-view-save" - string identifier of the command.
 * name: "Save Sugar View" - name of the command.
 * plugin: Instance of SugarRushPlugin which is assigned upon object creation through the constructor.
 *
 * The class has a constructor that takes a SugarRushPlugin object as a parameter and assigns it to the plugin property.
 *
 * It also has a checkCallback property which is defined as a method that takes a boolean value 'checking', and returns a boolean or void.
 * When 'checking' is true, it checks if there are any ongoing operations in the SugarRushPlugin instance.
 * If 'checking' is false, it opens the Sugar Operation View modal in the SugarRushPlugin instance.
 **/
export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
	plugin: SugarRushPlugin;

	/**
	 * Creates a new Save teh sugar view(s) command
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
