import { gutter } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { AbstractExtension } from "plugin-sugar-rush/contracts/AbstractExtension";
import type SugarRushPlugin from "plugin-sugar-rush/main";

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
