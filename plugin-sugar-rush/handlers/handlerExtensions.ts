import type SugarRushPlugin from "../main";
import { type Extension } from "@codemirror/state";
import FormatExtension from "plugin-sugar-rush/extensions/formatExtension";
import SizeExtension from "plugin-sugar-rush/extensions/sizeExtension";

/**
 * SugarRushExtensionHandler class manages the configuration of SugarRush plugins and its extensions.
 * @property {SugarRushPlugin} plugin - Stores the plugin that is currently being managed.
 * @property {Extension[]} extensions - Stores the set of extensions that are associated with the current plugin.
 * @method clearExtensions() - Reinitializes the 'extensions' property to an empty array, effectively clearing all extensions.
 * @method getExtensions() - Reinitializes and updates the 'extensions' property
 * based on whether 'showFileIcons' setting is enabled for the plugin.
 * Returns the current set of extensions.
 */
export default class SugarRushExtensionHandler {
	private readonly plugin: SugarRushPlugin;
	extensions!: Extension[];

	/**
	 * Creates a new extension handler for the Sugar Rush Plugin.
	 * @param {SugarRushPlugin} plugin - Stores the plugin
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extensions = this.getExtensions();
		this.plugin.registerEditorExtension([this.extensions]);
		this.clearExtensions()
	}

	/**
	 * The `clearExtensions` method is a member of the `SugarRushExtensionHandler` class.
	 * It sets the value of the `extensions` property to an empty array.
	 * This effectively clears the extensions array connected with the current plugin in the `SugarRushExtensionHandler` instance.
	 */

	clearExtensions() {
		this.extensions = [];
	}

	/**
	 * The `getExtensions` method belongs to the `SugarRushExtensionHandler` class.
	 * It first clears the `extensions` array and then checks the settings of the plugin 
	 * to determine which extensions to add.
	 **/
	getExtensions() {
		this.extensions = [];
		if (this.plugin.settings.showFileIcons) {
			this.extensions.push(new FormatExtension(this.plugin));
		}
		if (this.plugin.settings.showFileSizes) {
			this.extensions.push(new SizeExtension(this.plugin));
		}
		return this.extensions;
	}
}

/**
 * The AbstractExtension class serves as a base class for creating custom extensions for the SugarRushPlugin.
 *
 * @property {SugarRushPlugin} plugin - A reference to the plugin object for which the extension is being managed.
 * @property {Extension} extension - The managed extension. It should be defined by the derived classes.
 *
 * @constructor
 * @param {SugarRushPlugin} plugin - Accepts a SugarRushPlugin object to initialize the `plugin` property.
 *
 * @method getExtension() - Returns the managed extension. It should be defined by the derived classes.
 */

export abstract class AbstractExtension {
	plugin: SugarRushPlugin;

	/**
	 * This constructor for the SugarRushExtensionHandler class accepts a single argument.
	 * @param {SugarRushPlugin} plugin - This is the plugin associated with the SugarRushExtensionHandler instance upon its creation.
	 */
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * The `getExtension` method is a member of the `AbstractExtension` class and it is used to get the current extension stored
	 * in the `extension` property.
	 * @throws {Error} - This method is abstract and should be implemented by the derived classes.
	 */

	getExtension(): Extension {
		throw new Error("Method not implemented.");
	}
}
