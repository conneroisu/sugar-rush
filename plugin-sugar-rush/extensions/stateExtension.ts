import { gutter } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type SugarRushPlugin from "../main";

/**
 * Extension that shows modifications to a suar file, +,-,~
 * @property plugin - reference to the instance of the plugin.
 **/
export default class IndicatorsExtension {
	private readonly plugin: SugarRushPlugin;
	
	/**
	 * Creates a new IndicatorsExtension that shows modifications to a sugar file
	 * @param plugin - The instance of the plugin.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Returns the extension
	 * @returns {Extension} - The extension
	 **/
	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				
			},
		});

	}
}
