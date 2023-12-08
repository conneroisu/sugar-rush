import commandRushToSugarView from "./commands/commandRushToSugarView";
import commandToggleHiddenFiles from "./commands/commandToggleHiddenFiles";
import SugarRushPlugin from "./main";

/**
 * Represents a command handler for the Sugar Rush plugin.
 **/
export default class SugarRushCommandHandler {
	// The plugin that this command handler belongs to.
	private plugin: SugarRushPlugin;

	/**
	 * Creates a new command handler for the Sugar Rush plugin.
	 * @param plugin The plugin that this command handler belongs to.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.addCommands();
	}

	/**
	 * Adds the commands to the plugin.
	 **/
	async addCommands() {
		this.plugin.addCommand(new commandRushToSugarView(this.plugin));
		this.plugin.addCommand(new commandToggleHiddenFiles(this.plugin));
	}
}
