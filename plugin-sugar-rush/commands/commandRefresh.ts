import { 
	type Command,
	Editor,
	MarkdownView,
	type MarkdownFileInfo
} from "obsidian";
import type SugarRushPlugin from "../main";

/**
 * commandRefreshSugarView class.
 * @implements {Command}
 *
 * Instance properties:
 * @property {SugarRushPlugin} plugin - A mandatory property that must be an instance of SugarRushPlugin.
 * @property {string} id - A unique identifier for the command. Initialized to "refresh-sugar-view".
 * @property {string} name - The name of the command. Initialized to "Refresh Sugar View".
 *
 * @property {Function} editorCallback - A callback function that takes an instance of the Editor class
 * and an instance of either MarkdownView or MarkdownFileInfo as arguments.
 * The callback function either returns boolean | void. This function will delete all the sugar
 * files in the vault and then reload the current file when executed.
 *
 * @constructor
 * @param {SugarRushPlugin} plugin - An instance of SugarRushPlugin.
 **/
export class commandRefreshSugarView implements Command {
	plugin!: SugarRushPlugin;
	
	/**
	 * Creates a new command that refreshes the sugar view
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	id: string = "refresh-sugar-view";
	name: string = "Refresh Sugar View";
	editorCallback: ((editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) = (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		// delete all of the sugar files in the vault and then reload the current file
		
		// delete all of the sugar files in the vault
		this.plugin.fileSystemHandler.deleteAllSugarFiles();

		// reload the current file
	};
}

