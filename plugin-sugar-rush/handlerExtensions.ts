import type SugarRushPlugin from "./main";
import { type Extension } from "@codemirror/state";
import { relativeLineIconGutter } from "./extensions/extensionFormat";

export default class SugarRushExtensionHandler {
    private plugin: SugarRushPlugin;
	extensions!: Extension[];
	
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
		this.extensions.push(relativeLineIconGutter);
		return this.extensions;
	}

}
