import { gutter, GutterMarker } from "@codemirror/view";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type { Extension } from "@codemirror/state";

/** 
 * Extension that shows midifications to a suar file 
 * @property plugin - The instance of the plugin.
 **/
export default class IndicatorsExtension implements AbstractExtension {
	plugin: SugarRushPlugin;
	extension: Extension;
	/** 
	 * Creates a new IndicatorsExtension that shows modifications to a sugar file
	 * @param plugin - The instance of the plugin.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extension = gutter({});
	}

	/**
	 * Returns the extension
	 * @returns {Extension} - The extension
	 **/
	getExtension(): Extension {
		return this.extension;
	}
}
