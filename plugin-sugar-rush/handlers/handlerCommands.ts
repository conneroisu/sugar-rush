import commandRushToSugarView from "../commands/commandRush";
import commandToggleHiddenFiles from "../commands/commandHidden";
import commandSelectSugarViewEntry from "../commands/commandSelect";
import commandSaveSugarView from "../commands/commandSave";
import commandRefreshSugarView from "../commands/commandRefresh";

import SugarRushPlugin from "../main";

/**
 * Class representing a handler for SugarRush commands.
 * @class SugarRushCommandHandler
 *
 * This handler is responsible for registering SugarRush commands to the SugarRushPlugin.
 * Note: Each new command is a unique implementation and needs to be manually added to this handler.
 *
 * @property {SugarRushPlugin} plugin - An instance of the SugarRushPlugin that this handler will register callbacks for.
 *
 * @constructor
 * @param {SugarRushPlugin} plugin - An instance of SugarRushPlugin to attach the commands.
 **/
export default class SugarRushCommandHandler {
	private readonly plugin: SugarRushPlugin;

	/**
	 * Create a command handler
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		// add commands of the sugar-rush plugin
		this.plugin.addCommand(new commandRushToSugarView(this.plugin));
		this.plugin.addCommand(new commandToggleHiddenFiles(this.plugin));
		this.plugin.addCommand(new commandSelectSugarViewEntry(this.plugin));
		this.plugin.addCommand(new commandSaveSugarView(this.plugin));
		this.plugin.addCommand(new commandRefreshSugarView(this.plugin));
	}
}
