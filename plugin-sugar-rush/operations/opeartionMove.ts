import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { AbstractOperation } from "./AbstractOperation";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

export class MoveOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	name: string = "Move";
	id: string = "move";
	description: string;
	icon: string = getIconForLineFileExtension("move");
	originalPath: string;
	movedPath: string;

	constructor(
		plugin: SugarRushPlugin,
		public path: string,
		public newPath: string
	) {
		this.plugin = plugin;
		this.description = `Would move ${this.path} to ${this.newPath}`;
		this.originalPath = this.path;
		this.movedPath = this.newPath;
	}

	run(): void {
		throw new Error("Method not implemented.");
	}
}
