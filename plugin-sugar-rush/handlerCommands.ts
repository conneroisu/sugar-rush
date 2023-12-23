import { type Command } from "obsidian";
import commandRushToSugarView from "./commands/commandRushToSugarView";
import commandToggleHiddenFiles from "./commands/commandToggleHiddenFiles";
import commandSelectSugarViewEntry from "./commands/commandSelectSugarViewEntry";
import commandSaveSugarView from "./commands/commandSaveSugarView";
import commandRefreshSugarView from "./commands/commandRefreshSugarView";

import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	plugin: SugarRushPlugin;
	commands: Command[] = [];

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.collectCommands();
		this.addCommands();
	}

	async collectCommands() {
		this.commands.push(new commandRushToSugarView(this.plugin));
		this.commands.push(new commandToggleHiddenFiles(this.plugin));
		this.commands.push(new commandSelectSugarViewEntry(this.plugin));
		this.commands.push(new commandSaveSugarView(this.plugin));
		this.commands.push(new commandRefreshSugarView(this.plugin));
	}

	async addCommands() {
		for (const command of this.commands) {
			this.plugin.addCommand(command);
		}
	}
}
