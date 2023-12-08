
import { Notice, type Command } from "obsidian";

export default class commandSelectSugarViewEntry implements Command {
	id: string = "sugar-view-entry-select";
	name: string = "Select Sugar View Entry";
	checkCallback?: () => boolean | void = () => {
		// Check if there is a current file
		new Notice("This is a notice!");
		// Check if the extension of the current file is .sugar
	};
}
