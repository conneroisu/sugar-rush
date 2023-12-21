import type SugarRushPlugin from "./main";
import { type Extension } from "@codemirror/state";
import { relativeLineIconGutter } from "./extensions/extensionFormatIcons";

export default class SugarRushExtensionHandler {
    plugin: SugarRushPlugin;
	extensions!: Extension[];
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.collectExtensions();
	}
	
    collectExtensions() {
		this.extensions.push(relativeLineIconGutter);
    }

	getExtensions() {
		// return a array of active extensions 
		return this.extensions;
	}

}
