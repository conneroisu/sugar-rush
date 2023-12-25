
import type { TAbstractFile } from "obsidian";
import { AbstractOperation } from "plugin-sugar-rush/handlers/handlerOperations";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

/**
 * Operation that renames an AbstractFile
 * @implements {AbstractOperation}
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
