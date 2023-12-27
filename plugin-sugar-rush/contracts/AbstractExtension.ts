import type { Extension } from "@codemirror/state";

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
import type SugarRushPlugin from "../main";

export abstract class AbstractExtension {
	plugin: SugarRushPlugin;

	/**
	 * This constructor for the SugarRushExtensionHandler class accepts a single argument.
	 * @param {SugarRushPlugin} plugin - This is the plugin associated with the SugarRushExtensionHandler instance upon its creation.
	 */
	protected constructor(plugin: SugarRushPlugin) {
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
