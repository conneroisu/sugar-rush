import type SugarRushPlugin from "plugin-sugar-rush/main";
import { getIconForLineFileExtension } from "plugin-sugar-rush/utils";
import type AbstractOperation from "./AbstractOperation";

/**
 * Allows creation of a new file or directory in the application, obsidian.
 * @export
 * @class CreateOperation
 * @implements {AbstractOperation}
 * @property {SugarRushPlugin} plugin - The instance of the `SugarRushPlugin`.
 * @property {string} name - Represents the name of the operation, in this case, "Create".
 * @property {string} description - The operation's purpose, in this case, creating a new file or directory at a specified path.
 * @property {string} icon - The assigned icon for this operation, provided by the `getIconForLineFileExtension("create")` method.
 * @property {string} id - The unique identifier for this operation, in this case, "create".
 * @property {string} path - The file or directory's path to be created.
 * @method constructor(plugin: SugarRushPlugin, path: string): void - Class constructor that initializes the `CreateOperation`.
 * @method run(): void - The main method that performs the operation, i.e., creating a new file or directory at the specified path.
 **/
export class CreateOperation implements AbstractOperation {
	plugin: SugarRushPlugin;
	description = "Creates a new file or directory at the given path";
	icon: string = getIconForLineFileExtension("create");
	id = "create";

	/**
	 * Creates an instance of create operation.
	 * @param {SugarRushPlugin} plugin - the plugin instance
	 * @param {string} path - the path to the file or directory to create
	 **/
	constructor(plugin: SugarRushPlugin, public path: string) {
		this.plugin = plugin;
	}

	/**
	 * Runs the operation, Create.
	 * @return {void}
	 **/
	run(): void {
		this.plugin.app.vault.create(this.path, "");
	}
}
