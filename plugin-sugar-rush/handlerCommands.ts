import { type Command } from "obsidian";
import commandRushToSugarView from "./commands/commandRushToSugarView";
import commandToggleHiddenFiles from "./commands/commandToggleHiddenFiles";
import commandSelectSugarViewEntry from "./commands/commandSelectSugarViewEntry";
import commandSaveSugarView from "./commands/commandSaveSugarView";
import commandRefreshSugarView from "./commands/commandRefreshSugarView";

import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	private plugin: SugarRushPlugin;
	commands: Command[] = [];

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.addCommands();
	}

	async addCommands() {
		this.plugin.addCommand(new commandRushToSugarView(this.plugin));
		this.plugin.addCommand(new commandToggleHiddenFiles(this.plugin));
		this.plugin.addCommand(new commandSelectSugarViewEntry(this.plugin));
		this.plugin.addCommand(new commandSaveSugarView(this.plugin));
		this.plugin.addCommand(new commandRefreshSugarView(this.plugin));
	}
}
