import { AbstractOperation } from "plugin-sugar-rush/operations/abstractOperation";
import { getIconForLineFileExtension } from "plugin-sugar-rush/utils";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * An operation that essentially moves files @implements {AbstractOperation}.
 *
 * @property {SugarRushPlugin} plugin - The plugin that this move operation is a part of.
 * @property {string} name - The name of the operation. Defaults to "Move".
 * @property {string} id - An identifier for the operation. Defaults to "move".
 * @property {string} description - A description of what the move operation does, typically involving moving from one path to another.
 * @property {string} icon - The icon associated with the move operation. Retrieved using the `getIconForLineFileExtension` function.
 * @property {string} originalPath - The original path from where a file or folder will be moved.
 * @property {string} movedPath - The new path where the file or folder is moved to.
 *
 * @param {SugarRushPlugin} plugin - The plugin that this move operation is a part of.
 * @param {string} path - The original path from where a file or folder will be moved.
 * @param {string} newPath - The new path where the file or folder is moved to.
 * @method run - Method to execute the move operation. Currently throws an "Error: Method not implemented" exception.
 **/
export class MoveOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	description: string;
	icon: string = getIconForLineFileExtension("move");
	originalPath: string;
	movedPath: string;
	newPath: string;
	path: string;

	/**
	 * Creates a new Move Operation.
	 **/
	constructor(plugin: SugarRushPlugin, path: string, newPath: string) {
		this.plugin = plugin;
		this.path = path;
		this.newPath = newPath;
		this.description = `Would move ${this.path} to ${this.newPath}`;
		this.originalPath = this.path;
		this.movedPath = this.newPath;
	}

	run(): void {
		throw new Error("Method not implemented.");
	}
}
