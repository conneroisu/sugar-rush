import type SugarRushPlugin from "src/main";
import { TFile, type Command, Editor, MarkdownView, type MarkdownFileInfo, Notice } from "obsidian";

/**
 * @implements {Command} Command
 * @description Represents a command to select @type {import("obsidian").TAbstractFile} in a Sugar View.
 **/
export default class commandSelectSugarViewEntry implements Command {
	id: string = "sugar-view-entry-select";
	name: string = "Select Sugar View Entry";
	plugin!: SugarRushPlugin;

	/**
	 * Creates a new command to select @type {import("obsidian").TAbstractFile} in a Sugar View.
	 * @param plugin The plugin that this command belongs to.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * @description Checks if the current file is a Sugar View selecting an entry if it is.
	 * @param editor The editor that the command was called from.
	 * @param ctx The context that the command was called from.
	 **/
	editorCallback: ((editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) = (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		if (isSugarFile(this.plugin.app.workspace.getActiveFile())) {
			selectEntry(editor, ctx);
		} else {
			new Notice("This is not a Sugar File!");
		}
	};
}

/**
 * @description Checks if a file is a Sugar File.
 * @param file - The file to check.
 * @returns {boolean} Whether or not the file is a Sugar File.
 **/
function isSugarFile(file: TFile | null): boolean {
	if (file === null) {
		return false;
	}
	return file.extension === "sugar";
}

function selectEntry(editor: Editor, view: MarkdownFileInfo | MarkdownView): void {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const line_text = line.slice(0, undefined);
	const id = parse_id(line_text);
	console.log("selected id: " + id);
}
/**
 * Returns the id of a line in a sugar file (within the a href).
 **/
function parse_id(line: string): string {
	return line.split("<a href=")[1].split(">")[0];
}
