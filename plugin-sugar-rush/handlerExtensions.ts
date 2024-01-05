import type SugarRushPlugin from "./main";
import { type Extension } from "@codemirror/state";
import FormatExtension from "plugin-sugar-rush/extensions/formatExtension";
import SizeExtension from "plugin-sugar-rush/extensions/sizeExtension";

/**
 * SugarRushExtensionHandler class manages the extension configuration of the Sugar Rush plugins
 * 
 * @property {SugarRushPlugin} plugin - Stores the plugin that is currently being managed.
 * @property {Extension[]} extensions - Stores the set of extensions that are associated with the current plugin.
 * 
 * @method clearExtensions() - Reinitializes the 'extensions' property to an empty array, effectively clearing all extensions.
 * @method getExtensions() - Reinitializes and updates the 'extensions' property based on whether 'showFileIcons' setting is enabled for the plugin.
 **/
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
	 **/
	clearExtensions() {
		this.extensions = [];
	}

	/**
	 * Gets all of the extensions active for the plugin.
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
