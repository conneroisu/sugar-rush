import { Notice } from "obsidian";
import SugarRushPlugin from "./main";

/**
 * Represents a handler for the Sugar Rush ribbon.
 */
export default class SugarRushRibbonHandler {
	plugin: SugarRushPlugin;

	/**
	 * Creates an instance of SugarRushRibbonHandler.
	 * @param plugin - The SugarRushPlugin instance.
	 */
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		if (this.plugin.settings.showRibbonIcon) {
			this.addRibbonIcon();
		}
	}

	/**
	 * Adds the Sugar Rush ribbon icon for rushing to a sugar view.
	 **/
	addRibbonIcon() {
		this.plugin.addRibbonIcon(
			"glass-water",
			"Sugar Rush : Rush To Sugar View",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
	}
}
