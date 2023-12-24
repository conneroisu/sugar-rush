import type { AbstractOperation } from "plugin-sugar-rush/operations/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { TAbstractFile } from "obsidian";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

/**
 * Operation that deletes a file or directory at the given path
 * @implements {AbstractOperation}
 **/
export class DeleteOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	file!: TAbstractFile;
	name: string = "Delete";
	description: string = "Deletes the file or directory at the given path";
	icon: string = getIconForLineFileExtension("delete");
	id: string = "delete";

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
	 * Runs the operation
	 * @return {void}
	 **/
	run(): void {
		// get teh abstract file at the path
		if (this.file) {
			this.plugin.app.vault.delete(this.file);
		}
	}
}
