import commandRushToSugarView from "./commands/commandRush";
import commandToggleHiddenFiles from "./commands/commandHidden";
import commandSelectSugarViewEntry from "./commands/commandSelect";
import commandSaveSugarView from "./commands/commandSave";

import SugarRushPlugin from "./main";
import commandRefreshSugarView from "plugin-sugar-rush/commands/commandRefresh";
import type { Editor } from "obsidian";

/**
 * Class representing a handler for SugarRush commands.
 * @class SugarRushCommandHandler
 * @property {SugarRushPlugin} plugin - An instance of the SugarRushPlugin that this handler will register callbacks for.
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
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				commandSelectSugarViewEntry(this.plugin, checking, editor)
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
	}
}
