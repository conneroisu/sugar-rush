import { gutter, GutterMarker } from "@codemirror/view";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as fs from "fs";

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


export class SizeMarker extends GutterMarker {
	constructor() {
		super();
	}
}

export const sizeGutter = gutter({
	lineMarker: (view, line) => {
		// const size = line.length;
		// return size ? new SizeMarker() : null;

	}
})
