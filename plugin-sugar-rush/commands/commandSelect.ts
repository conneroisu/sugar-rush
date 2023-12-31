import SugarRushPlugin from "plugin-sugar-rush/main";

import { Editor, TFile, TFolder } from "obsidian";

export default function commandSelectEntry(plugin: SugarRushPlugin, checking: boolean, editor: Editor) {
	const activeFile = plugin.app.workspace.getActiveFile();
	const leaf = plugin.app.workspace.getMostRecentLeaf();
	if (checking) {
		return true;
	}
	if (activeFile && activeFile.extension === "sugar") {
		const id = editor.getLine(editor.getCursor().line).split("<a href=")[1].split(">")[0];
		const file = plugin.fileSystemHandler.abstractMap.get(parseInt(id));
		if (!file || !leaf) {
			return false;
		}
		if (file instanceof TFile) {
			if (plugin.settings.debug) {
				console.log("commandSelectSugarViewEntry.ts: selecting and opening TFile: " + file.path);
			}
			plugin.fileSystemHandler.loadFile(file, leaf);
		}
		if (file instanceof TFolder) {
			if (plugin.settings.debug) {
				console.log("commandSelectSugarViewEntry.ts: selecting and opening TFolder: " + file.path);
			}
		}

		return true;
	}
	if (plugin.settings.debug) {
		console.log("commandSelectSugarViewEntry.ts: not selecting anything | checking is ");
	}
	return false;
}
