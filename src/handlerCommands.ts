import { type Command } from "obsidian";
import commandRushToSugarView from "./commands/commandRushToSugarView";
import commandToggleHiddenFiles from "./commands/commandToggleHiddenFiles";
import commandSelectSugarViewEntry from "./commands/commandSelectSugarViewEntry";
import commandSaveSugarView from "./commands/commandSaveSugarView";

import SugarRushPlugin from "./main";

/**
 * Represents a command handler for the Sugar Rush plugin.
 **/
export default class SugarRushCommandHandler {
	// The plugin that this command handler belongs to.
	private plugin: SugarRushPlugin;
	commands: Command[] = [];

	/**
	 * Creates a new command handler for the Sugar Rush plugin.
	 * @param plugin The plugin that this command handler belongs to.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.collectCommands();
		this.addCommands();
	}

	/**
	 * Collects the commands for the plugin.
	 **/
	async collectCommands() {
		this.commands.push(new commandRushToSugarView(this.plugin));
		this.commands.push(new commandToggleHiddenFiles(this.plugin));
		this.commands.push(new commandSelectSugarViewEntry(this.plugin));
		this.commands.push(new commandSaveSugarView(this.plugin));
	}

	/**
	 * Adds the commands to the plugin from the commands array.
	 **/
	async addCommands() {
		for (const command of this.commands) {
			this.plugin.addCommand(command);
		}
	}
}
