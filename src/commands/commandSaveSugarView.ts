
import { Notice, type Command } from "obsidian";

export default class commandSaveSugarView implements Command {
	id: string = "sugar-view-save";
	name: string = "Save Sugar View";
	checkCallback?: () => boolean | void = () => {
		// Check if there is a current file
		new Notice("This is a notice!");
		// Check if the extension of the current file is .sugar
	};
}
