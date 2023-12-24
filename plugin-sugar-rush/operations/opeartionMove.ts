import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { AbstractOperation } from "./AbstractOperation";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

export class MoveOperation implements AbstractOperation {
	constructor(
		plugin: SugarRushPlugin,
		public path: string,
		public newPath: string
	) {
		this.plugin = plugin;
	}
	plugin: SugarRushPlugin;
	name: string = "Move";
	description: string =
		"Moves the file or directory at the given path to the new path";
	icon: string = getIconForLineFileExtension("move");
	id: string = "move";
	run(): void {
		throw new Error("Method not implemented.");
	}
}
