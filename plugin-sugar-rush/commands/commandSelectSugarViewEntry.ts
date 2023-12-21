import { 
	type Command,
	Editor,
	MarkdownView,
	type MarkdownFileInfo,
	TFile,
	TFolder
} from "obsidian";
import type SugarRushPlugin from "src/main";

export default class commandSelectSugarViewEntry implements Command {
	id: string = "sugar-view-entry-select";
	name: string = "Select Sugar View Entry";
	plugin!: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	editorCheckCallback?: ((checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void) | undefined = (checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		const leaf = this.plugin.app.workspace.getMostRecentLeaf();
		if(checking) {
			return true;
		}
		if (activeFile && this.plugin.fileSystemHandler.isSugarFile(activeFile)) {
			const id = editor.getLine(editor.getCursor().line).split("<a href=")[1].split(">")[0];
			const file = this.plugin.fileSystemHandler.abstractMap.get(parseInt(id));
			if (!file || !leaf) {
				return false;
			}
			if (file instanceof TFile) {
				if (this.plugin.settings.debug) {
					console.log("commandSelectSugarViewEntry.ts: selecting and opening TFile: " + file.path);
				}
				this.plugin.fileSystemHandler.loadRegularFile(file, leaf);
			}
			if (file instanceof TFolder) {
				if (this.plugin.settings.debug) {
					console.log("commandSelectSugarViewEntry.ts: selecting and opening TFolder: " + file.path);
				}
			}

			return true;
		}
		if (this.plugin.settings.debug) {
			console.log("commandSelectSugarViewEntry.ts: not selecting anything | checking is ");
		}
		return false;
	};
}


function selectEntry(editor: Editor): void {
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
