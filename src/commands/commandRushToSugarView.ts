import { Notice, type Command } from "obsidian";

export default class commandRushToSugarView implements Command {
	id: string = "rush-to-sugar-view";
	name: string = "Rush To Sugar View";
	checkCallback?: () => boolean | void = () => {
		new Notice("This is a notice!");
	};
}
