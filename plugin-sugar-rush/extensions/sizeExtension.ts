import { gutter, GutterMarker } from "@codemirror/view";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as fs from "fs";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type { Extension } from "@codemirror/state";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Returns the size of a file or sum of sizes of all files within a folder, recursively.
 *
 * The function accepts as parameter an object of type TFile or TFolder.
 * When the passed object is of type TFile, it directly returns the size of the file, extracted as `file.stat.size`.
 * In case of a TFolder object, the method iteratively checks each child element of that folder.
 * For each child, it makes a recursive call to `getSizeForAbstractFile()` to calculate their respective sizes.
 *
 * It utilizes recursion to calculate and aggregate sizes of files in nested directories.
 *
 * @param {TFile | TFolder} file - File or folder to get the size for.
 * @returns The size of the file or sum of sizes of all files in the folder. Returns 0 if there are no files in the folder.
 */

export function getSizeForAbstractFile(file: TFile | TFolder) {
	if (file instanceof TFile) {
		return file.stat.size;
	}

	let sum = 0;
	file.children.forEach((child) => {
		if (child instanceof TFile) {
			const res = getSizeForAbstractFile(child);
			if (res) {
				sum += res;
			}
		} else if (child instanceof TFolder) {
			const res = getSizeForAbstractFile(child);
			if (res) {
				sum += res;
			}
		}
	});
	return sum;
}

/**
 * The `sizeGutter` constant is an instance of a "Gutter". It's constructed by calling the exported function `gutter()` from the
 * "@codemirror/view" package. It encapsulates the operations needed for marking lines in the codemirror view and is designed to
 * add a gutter to the line numbers column, marking lines with a `SizeMarker` instance, or not marking them, based on certain conditions.
 *
 * It's configured through an object passed to the `gutter()` function, containing a single method named `lineMarker`. This method is
 * executed for every line in the editor, accepting two parameters:
 * - `view` that represents the current editor view.
 * - `line` which is the line object that is currently being processed.
 *
 * Inside the `lineMarker`, the size of the line (commented out in the given snippet) can be calculated by checking the `line.length`
 * property or using any other operation. If the line's size meets certain conditions (also commented out), a new instance of `SizeMarker`
 * is returned by the method. If not, `null` is returned, indicating that for the considered line, no marker is to be placed in the gutter.
 *
 * Note: The actual implementation of the `lineMarker` method's logic is commented out in the provided snippet.
 */
export default class SizeExtension extends AbstractExtension {
	constructor(plugin: SugarRushPlugin) {
		super(plugin);
	}

	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				// search the abstract map for the fileSystemHandler
				const lineForFile = view.state.doc.line(
					view.state.doc.lineAt(line.from).number
				);
			},
		});
	}

	// export const sizeGutter = gutter({
	//     lineMarker: (view, line) => {
	//         // const size = line.length;
	//         // return size ? new SizeMarker() : null;
	//     },
	// });
}
