import { type Command } from "obsidian";
import type SugarRushPlugin from "../main";

/**
 * The `commandToggleHiddenFiles` class implements the `Command` interface for the `SugarRushPlugin`.
 *
 * @property {SugarRushPlugin} plugin - An instance of 'SugarRushPlugin', which will be used.
 * @property {string} id - The unique identifier for this command "toggle-hidden-files-in-sugar".
 * @property {string} name - The visible name of the command "Toggle Hidden Files In Sugar Views".
 *
 * @constructor Initializes a new `commandToggleHiddenFiles` instance.
 * Takes a 'SugarRushPlugin' instance as a parameter and assigns it to `plugin` property.
 *
 * @method editorCheckCallback - A method that toggles the value of the 'showHiddenFiles' setting of the 'SugarRushPlugin', and then saves the plugin settings.
 **/
export default class commandToggleHiddenFiles implements Command {
	plugin!: SugarRushPlugin;
	id: string = "toggle-hidden-files-in-sugar";
	name: string = "Toggle Hidden Files In Sugar Views";

	/**
	 * Creates a Command that toggles the hidden files setting and reloads the view.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback: (checking: boolean) => boolean | void = () => {
		this.plugin.settings.showHiddenFiles = !this.plugin.settings.showHiddenFiles;
		this.plugin.saveSettings();
	};
}
