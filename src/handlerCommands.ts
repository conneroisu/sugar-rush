import SugarRushPlugin from "./main";
import commandRushToSugarView from "./commands/commandRushToSugarView";
import commandToggleHiddenFiles from "./commands/commandToggleHiddenFiles";

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
		this.plugin.addCommand(new commandRushToSugarView());
		this.plugin.addCommand(new commandToggleHiddenFiles(this.plugin));
	}
}
