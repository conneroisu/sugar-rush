import type { TAbstractFile } from "obsidian";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/formatExtension";
import { AbstractOperation } from "plugin-sugar-rush/handlers/handlerOperations";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Operation that duplicates an AbstractFile to a new given path.
 * @implements {AbstractOperation}
 * @property {SugarRushPlugin} plugin - The instance of the plugin where the operation will be performed.
 * @property {TAbstractFile} file - The abstract representation of the file or directory to be deleted.
 * @property {string} name - The name of operation.
 * @property {string} description - The description of operation.
 * @property {string} icon - The icon for the operation given by the file extension
 * @property {string} id - The identifier for the operation.
 * @property {string} newPath - The new path of the file
 * @method run(): void - The method that performs the rename operation.
 **/
export class DuplicateOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	name: string = "Duplicate";
	description: string = "Duplicates the file or directory at the given path";
	icon: string = getIconForLineFileExtension("duplicate");
	id: string = "duplicate";

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
		throw new Error("Method not implemented.");
	}
}
