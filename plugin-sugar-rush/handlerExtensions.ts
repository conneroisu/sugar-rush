import type SugarRushPlugin from "./main";
import { type Extension } from "@codemirror/state";
import { relativeLineIconGutter } from "./extensions/extensionFormatIcons";

export default class SugarRushExtensionHandler {
    private plugin: SugarRushPlugin;
	private extensions!: Extension[];
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.collectExtensions();
		this.plugin.registerEditorExtension([this.extensions]);
	}
	
	clearExtensions() {
		this.extensions = [];
	}

    collectExtensions() {
		this.extensions.push(relativeLineIconGutter);
    }

	getExtensions() {
		// return a array of active extensions 
		return this.extensions;
	}

}
