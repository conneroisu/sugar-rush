import { Notice } from "obsidian";
import SugarRushPlugin from "./main";

export default class SugarRushRibbonHandler {
	plugin: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		if (this.plugin.settings.showRibbonIcon) {
			this.addRibbonIcon();
		}
	}

	addRibbonIcon() {
		this.plugin.addRibbonIcon("glass-water", "Sugar Rush", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice("This is a notice!");
		});
	}

}
