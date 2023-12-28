import commandRushToSugarView from "../commands/commandRushh";
import commandToggleHiddenFiles from "../commands/commandHidden";
import commandSelectSugarViewEntry from "../commands/commandSelect";
import commandSaveSugarView from "../commands/commandSave";

import SugarRushPlugin from "../main";
import { commandRefreshSugarView } from "plugin-sugar-rush/commands/commandRefresh";

/**
 * Class representing a handler for SugarRush commands.
 * @class SugarRushCommandHandler
 * This handler is responsible for registering SugarRush commands to the SugarRushPlugin.
 * Note: Each new command is a unique implementation and needs to be manually added to this handler.
 * @property {SugarRushPlugin} plugin - An instance of the SugarRushPlugin that this handler will register callbacks for.
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
		this.plugin.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush to Sugar View",
			editorCheckCallback: (checking: boolean) => {
				commandRushToSugarView(this.plugin, checking)
			}
		});
		this.plugin.addCommand({
			id: "toggle-hidden-files",
			name: "Toggle Hidden Files",
			editorCheckCallback: (checking: boolean) => {
				commandToggleHiddenFiles(this.plugin, checking)
			}
		});
		this.plugin.addCommand({
			id: "select-sugar-view-entry",
			name: "Select Sugar View Entry",
			editorCheckCallback: (checking: boolean) => {
				commandSelectSugarViewEntry(this.plugin, checking)
			}
		});
		this.plugin.addCommand({
			id: "save-sugar-view",
			name: "Save Sugar View",
			editorCheckCallback: (checking: boolean) => {
				commandSaveSugarView(this.plugin, checking)
			}
		});
		this.plugin.addCommand({
			id: "refresh-sugar-view",
			name: "Refresh Sugar View",
			editorCheckCallback: (checking: boolean) => {
				commandRefreshSugarView(this.plugin, checking)
			}
		});
		this.plugin.addCommand(new commandRushToSugarView(this.plugin));
		this.plugin.addCommand(new commandToggleHiddenFiles(this.plugin));
		this.plugin.addCommand(new commandSelectSugarViewEntry(this.plugin));
		this.plugin.addCommand(new commandSaveSugarView(this.plugin));
		this.plugin.addCommand(new commandRefreshSugarView(this.plugin));
	}
}
