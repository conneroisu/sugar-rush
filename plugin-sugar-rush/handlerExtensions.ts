import type SugarRushPlugin from "./main";
import { type Extension } from "@codemirror/state";
import { formatGutter } from "./extensions/extensionFormat";

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
		if(this.plugin.settings.showFileIcons) {
			this.extensions.push(formatGutter);
		}
		return this.extensions;
	}

}
