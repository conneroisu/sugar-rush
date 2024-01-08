import type { TAbstractFile } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { getIconForLineFileExtension } from "plugin-sugar-rush/utils";

/**
 * Operation that renames an AbstractFile to a new given path.
 * @implements {AbstractOperation}
 * @property {SugarRushPlugin} plugin - The instance of the plugin where the operation will be performed.
 * @property {TAbstractFile} file - The abstract representation of the file or directory to be deleted.
 * @property {string} name - The name of operation.
 * @property {string} description - The description of operation.
 * @property {string} icon - The icon for the operation given by the file extension
 * @method run - void
 **/
export class RenameOperation {
	plugin: SugarRushPlugin;
	description = "Renames abstract file to the new path. ";
	icon: string = getIconForLineFileExtension("rename");
	id = "rename";

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
