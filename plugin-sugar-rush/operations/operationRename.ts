import type { TAbstractFile } from "obsidian";
import { AbstractOperation } from "plugin-sugar-rush/handlers/handlerOperations";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

/**
 * Operation that renames an AbstractFile to a new given path.
 * @implements {AbstractOperation}
 * @property plugin - The plugin instance.
 * @property name - The name of the operation, Rename.
 * @property description - The description of the operation, Rename,
 * @property icon - The icon of the operation, Rename.
 * @method run - Runs the operation, Rename.
 **/
export class RenameOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	name: string = "Rename";
	description: string =
		"Renames the abstract file at the given path to the new path. Moves the contents if it is a folder.";
	icon: string = getIconForLineFileExtension("rename");

	/**
	 * Creates an instance of RenameOperation.
	 * @param {SugarRushPlugin} plugin - The plugin instance
	 * @param {TAbstractFile} abstractFile - The file to rename
	 * @param {string} newPath - The new path of the file
	 **/
	constructor(
		plugin: SugarRushPlugin,
		public abstractFile: TAbstractFile,
		public newPath: string
	) {
		this.plugin = plugin;
	}

	/**
	 * Runs the operation
	 * @return {void}
	 **/
	run(): void {
		this.plugin.app.vault.rename(this.abstractFile, this.newPath);
	}
}
