import { Notice } from "obsidian";
import SugarRushPlugin from "./main";

/**
 * Represents a command handler for the Sugar Rush plugin.
 */
export default class SugarRushCommandHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.addCommands();
	}

	/**
	 * Adds the commands to the plugin.
	 */
	async addCommands() {
		this.plugin.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush To Sugar View",
			callback: () => {
				new Notice("This is a notice!");
			},
		});

		this.plugin.addCommand({
			id: "toggle-hidden-files-in-sugar",
			name: "Toggle Hidden Files In Sugar Views",
			callback: () => {
				this.plugin.settings.showHiddenFiles =
					!this.plugin.settings.showHiddenFiles;
			},
		});
	}
}
