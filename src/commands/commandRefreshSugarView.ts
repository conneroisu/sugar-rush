
import { Notice, type Command, Editor, MarkdownView, type MarkdownFileInfo } from "obsidian";
import type SugarRushPlugin from "src/main";
import { isSugarFile } from "src/utils/sugarCharacterizer";

export default class commandRefreshSugarView implements Command {
	private plugin!: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	id: string = "refresh-sugar-view";
	name: string = "Refresh Sugar View";
	editorCallback: ((editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) = (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		if (isSugarFile(this.plugin.app.workspace.getActiveFile())) {
			
		}
		new Notice("This is a notice!");
	};
}

