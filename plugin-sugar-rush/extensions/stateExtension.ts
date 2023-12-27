import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";
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
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extension = gutter({});
	}
	getExtension(): Extension {
		return this.extension;
	}
}
