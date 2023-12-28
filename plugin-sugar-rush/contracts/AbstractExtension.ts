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

export default abstract class AbstractExtension {
	plugin: SugarRushPlugin;

	/**
	 * This constructor for the SugarRushExtensionHandler class 
	 * it accepts a single argument, a reference to the Sugar Rush Plugin.
	 * @param {SugarRushPlugin} plugin - reference to the Sugar Rush Plugin.
	 */
	protected constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * The `getExtension` method is a member of the `AbstractExtension` class 
	 * and it is used to get the current extension being managed.
	 */
	abstract getExtension(): Extension;
}
