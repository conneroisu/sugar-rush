import type { TAbstractFile } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { getIconForLineFileExtension } from "plugin-sugar-rush/utils";
import type AbstractOperation from "./AbstractOperation";

/**
 * Class `DeleteOperation` - representation of a delete operation.
 * Implements the `AbstractOperation` interface.
 * Provides methods for deleting a file or directory at a specified path.
 * @property {SugarRushPlugin} plugin - The instance of the plugin where the operation will be performed.
 * @property {TAbstractFile} file - The abstract representation of the file or directory to be deleted.
 * @property {string} name - The name of operation.
 * @property {string} description - The description of operation.
 * @property {string} icon - The icon for the operation given by the file extension
 * @property {string} id - The identifier for the operation.
 * @constructor
 * @param {SugarRushPlugin} plugin - The plugin where the operation will be performed.
 * @param {string} path - The path to the file or directory that should be deleted.
 * @method run(): void - The method that performs the delete operation.
 **/
export class DeleteOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	file!: TAbstractFile;
	description = "Deletes the file or directory at the given path";
	id = "delete";

	/**
	 * Creates an instance of delete operation.
	 * @param plugin - the plugin instance
	 * @param path - the path to the file or directory to delete
	 **/
	constructor(plugin: SugarRushPlugin, public path: string) {
		this.plugin = plugin;
		const result = this.plugin.app.vault.getAbstractFileByPath(this.path);
		if (result) {
			this.file = result;
		}
	}
	/**
	 * Runs the operation, Delete.
	 * @return {void}
	 **/
	run(): void {
		// get the abstract file at the path
		if (this.file) {
			this.plugin.app.vault.delete(this.file);
		}
	}
}
