import { Notice, type Command } from "obsidian";

export default class commandRushToSugarView implements Command {
	id: string = "rush-to-sugar-view";
	name: string = "Rush To Sugar View";
	callback?: () => void = () => {
		// Called when the user clicks the icon.
		new Notice("This is a notice!");
	};
}
