import type SugarRushPlugin from "../main";
import { type Extension } from "@codemirror/state";
import FormatExtension from "plugin-sugar-rush/extensions/formatExtension";
import SizeExtension from "plugin-sugar-rush/extensions/sizeExtension";

/**
 * SugarRushExtensionHandler class manages the configuration of SugarRush plugins and its extensions.
 *
 * @property {SugarRushPlugin} plugin - Stores the plugin that is currently being managed.
 * @property {Extension[]} extensions - Stores the set of extensions that are associated with the current plugin.
 *
 * @constructor
 * @param {SugarRushPlugin} plugin - Accepts a SugarRushPlugin object to initialize the 'plugin' property.
 * Upon instantiation, the constructor also initializes the 'extensions' property
 * and registers this set of extensions to the plugin.
 *
 * @method clearExtensions() - Reinitializes the 'extensions' property to an empty array, effectively clearing all extensions.
 *
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
		this.plugin.registerEditorExtension(this.extensions);
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
	 * It first clears the `extensions` array and then checks if the 'showFileIcons' setting is enabled for the plugin.
	 * In case the setting is enabled, it pushes the `formatGutter` extension into the `extensions` array.
	 * Finally, it returns the `extensions` array.
	 **/

	getExtensions() {
		this.extensions = [];
		if (this.plugin.settings.showFileIcons) {
			this.extensions.push(new FormatExtension(this.plugin));
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
	extension!: Extension;

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
	 *
	 * @returns {Extension} The current extension stored in the `extension` property.
	 */

	getExtension(): Extension {
		return this.extension;
	}
}
