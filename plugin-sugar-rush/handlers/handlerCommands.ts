import commandRushToSugarView from "./commands/commandRush";
import commandToggleHiddenFiles from "./commands/commandHidden";
import commandSelectSugarViewEntry from "./commands/commandSelect";
import commandSaveSugarView from "./commands/commandSave";
import commandRefreshSugarView from "./commands/commandRefresh";

import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	private plugin: SugarRushPlugin;

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
