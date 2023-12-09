import type SugarRushPlugin from "src/main";
import { TFile, type Command } from "obsidian";

/**
 * @implements {Command} Command
 * @description Represents a command to select @type {import("obsidian").TAbstractFile} in a Sugar View.
 **/
export default class commandSelectSugarViewEntry implements Command {
	id: string = "sugar-view-entry-select";
	name: string = "Select Sugar View Entry";
	plugin!: SugarRushPlugin;

	/**
	 * Creates a new command to select @type {import("obsidian").TAbstractFile} in a Sugar View.
	 * @param plugin The plugin that this command belongs to.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * @description Checks if the current file is a Sugar View selecting an entry if it is.
	 * @param checking - Whether or not the editor is checking if the command can be run.
	   * @returns {boolean | void} Whether or not the command can be run.
	 **/
	editorCheckCallback: (checking: boolean) => (boolean | void) = (checking: boolean): boolean | void => {
		const isSugarView = isSugarFile(this.plugin.app.workspace.getActiveFile());
		if (isSugarView) {
			if (checking) {
				selectEntry();
			}
			return true;
		}
		return false;
	};
}

/**
 * @description Checks if a file is a Sugar File.
 * @param file - The file to check.
 * @returns {boolean} Whether or not the file is a Sugar File.
 **/
function isSugarFile(file: TFile | null): boolean {
	if (file === null) {
		return false;
	}
	return file.extension === "sugar";
}

function selectEntry() {

}

