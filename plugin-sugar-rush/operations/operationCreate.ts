import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { AbstractOperation } from "./AbstractOperation";
import { getIconForLineFileExtension } from "plugin-sugar-rush/extensions/extensionFormat";

/**
 * Operation that creates a new file or directory at the given path
 * @implements {AbstractOperation}
 */
export class CreateOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	name: string = "Create";
	description: string = "Creates a new file or directory at the given path";
	icon: string = getIconForLineFileExtension("create");
	id: string = "create";

	/**
	 * Creates an instance of create operation.
	 * @param plugin - the plugin instance
	 * @param path - the path to the file or directory to create
	 **/
	constructor(plugin: SugarRushPlugin, public path: string) {
		this.plugin = plugin;
	}

	/**
	 * Runs the operation
	 * @return {void}
	 **/
	run(): void {
		this.plugin.app.vault.create(this.path, "");
	}
}
