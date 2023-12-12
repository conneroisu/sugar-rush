import type { TFile } from "obsidian";

/**
 * @description Checks if a file is a Sugar File.
 * @param file - The file to check.
 * @returns {boolean} Whether or not the file is a Sugar File.
 **/
export function isSugarFile(file: TFile | null): boolean {
	if (file === null) {
		return false;
	}
	return file.extension === "sugar";
}
