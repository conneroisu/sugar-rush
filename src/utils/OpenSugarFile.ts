import { Notice, TFile } from "obsidian";
import SugarRushPlugin from "../main";

export async function open_sugar_file(SugarRushPlugin: SugarRushPlugin) {
	const file = SugarRushPlugin.app.workspace.getActiveFile();
	if (file == null)
		return new Notice("Tried Open Sugar, but No file is open.");
	if (file.extension != "md" && file.extension != "sugar") return;
	if (file.extension == "sugar") return open_sugar_file_for_sugar_file(file);
	return open_sugar_file_for_note_file(file);
}

/**
 * Opens the sugar file of the given file's directory. (Creates one if it doesn't exist.)
 * @param file - The file to be opened.
 */
async function open_sugar_file_for_note_file(file: TFile) {}

/**
 * Opens the sugar file of the given file's directory. (Creates one if it doesn't exist.)
 * @param file - The file to be opened.
 */
async function open_sugar_file_for_sugar_file(file: TFile) {}
