import { Notice, type Command, type MarkdownFileInfo, MarkdownView, Editor, type Hotkey } from "obsidian";
import type SugarRushPlugin from "src/main";
import { isSugarFile } from "src/utils/sugarCharacterizer";

export default class commandRushToSugarView implements Command {
	plugin!: SugarRushPlugin;

	id: string = "rush-to-sugar-view";
	name: string = "Rush to Sugar View";
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}
	icon?: string | undefined;
	mobileOnly?: boolean | undefined = false;
	repeatable?: boolean | undefined;
	// callback?: (() => any) | undefined;
	// checkCallback?: ((checking: boolean) => boolean | void) | undefined;
	// editorCheckCallback?: ((checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) | undefined;
	// hotkeys?: Hotkey[] | undefined;

	/**
	 * @description Checks if the current file is a Sugar View selecting an entry if it is.
	 * @param editor The editor that the command was called from.
	 * @param ctx The context that the command was called from.
	 **/
	editorCallback: ((editor: Editor) => boolean | void) = (editor: Editor) => {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (activeFile) {
			if (isSugarFile(activeFile)) {
				new Notice("This is a Sugar File!");
			} else {
				new Notice("This is not a Sugar File!");
				// create a new file with the name of the parent folder of the current file
				if (activeFile.parent) {
					new Notice("There is a parent folder!: " + activeFile.parent.name);
				} else {
					new Notice("There is no parent folder! Returning Root!");
				}
			}
		} else {
			new Notice("There is no active file!");
		}
	};
}


/**
 * Generates a random id for a line in a sugar files.
 **/
function generate_id(): string {
	return (
		"<a href=" +
		Math.random().toString(5).substring(2, 7) +
		">" +
		"</a>"
	);
}
