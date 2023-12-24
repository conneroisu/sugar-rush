import type SugarRushPlugin from "../main";
import { type Extension } from "@codemirror/state";
import { formatGutter } from "../extensions/extensionFormat";

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
    private readonly  plugin: SugarRushPlugin;
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
	
	clearExtensions() {
		this.extensions = [];
	}

	getExtensions() {
		this.extensions = [];
		if(this.plugin.settings.showFileIcons) {
			this.extensions.push(formatGutter);
		}
		return this.extensions;
	}
}

export abstract class AbstractExtension {
	private plugin: SugarRushPlugin;
	private extension!: Extension;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	getExtension(): Extension {
		return this.extension;
	}
}
