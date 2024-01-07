import { TAbstractFile, TFile, TFolder } from "obsidian";
import assets from "./!icons.json";

/**
 * Returns the icon that corresponds to the given file extension from the assets file.
 * If no icon is associated with this extension, it will return the default icon instead.
 * @param {string} extension - The string referencing the file extension for which an icon is to be retrieved.
 * @return {string} - It returns the icon data string corresponding to the provided file extension.
 */
export function getIconForLineFileExtension(extension: string): string {
	const icon = assets["extension-associations"].find((association) => {
		return association.extensions.includes(extension);
	});
	if (icon === undefined) {
		const defaultIcon = assets["extension-associations"].find(
			(association) => {
				return association.extensions.includes("*");
			}
		);
		if (defaultIcon === undefined) {
			return "";
		}
		return defaultIcon.data;
	}
	return icon.data;
}
/**
 * Returns the size of a file or sum of sizes of all files within a folder, recursively.
 * @param {TFile | TFolder} file - File or folder to get the size for.
 * @returns The size of the file or sum of sizes of all files in the folder. Returns 0 if there are no files in the folder.
 */

export function getSizeForAbstractFile(file: TAbstractFile) {
	if (file instanceof TFile) {
		return file.stat.size;
	}

	if (file instanceof TFolder) {
		let sum = 0;
		for (const child of file.children) {
			const res = getSizeForAbstractFile(child);
			if (res) {
				sum += res;
			}
		}
		return sum;
	}

	return 0;
}

/**
 * Parses the id of the exception from the line of code.
 * @param line - The line of code.
 * @returns The id of the exception.
 * @example
 * // returns "1"
 * parse_id("1 <a href="1">")
 * @example
 * // returns "2"
 * parse_id("2 <a href="2">")
 **/
export function parse_id(line: string): string {
	return line.split("<a href=")[1].split(">")[0];
}
