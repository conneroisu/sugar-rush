import { 
	type Command,
	Editor,
	MarkdownView,
	type MarkdownFileInfo
} from "obsidian";
import type SugarRushPlugin from "../main";

export default class commandRefreshSugarView implements Command {
	plugin!: SugarRushPlugin;
	
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

