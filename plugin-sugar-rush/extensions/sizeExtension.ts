import type { Extension } from "@codemirror/state";
import { gutter } from "@codemirror/view";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import AbstractExtension from "plugin-sugar-rush/contracts/AbstractExtension";
import type SugarRushPlugin from "plugin-sugar-rush/main";

import { SizeMarker } from "plugin-sugar-rush/markers/markerSize";

/**
 * Returns the size of a file or sum of sizes of all files within a folder, recursively.
 * @param {TFile | TFolder} file - File or folder to get the size for.
 * @returns The size of the file or sum of sizes of all files in the folder. Returns 0 if there are no files in the folder.
 */

export function getSizeForAbstractFile(file: TAbstractFile) {
	if (file instanceof TFile) {
		return file.stat.size
	}

	if (file instanceof TFolder) {
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

	return 0;
}

/**
 * Size Extension that shows the size of a file in the gutter.
 **/
export default class SizeExtension implements AbstractExtension {
	plugin: SugarRushPlugin;
	extension: Extension;

	/**
	 * Creates a SizeExtension that shows the size of a file in the gutter.
	 * @param plugin - The instance of the plugin.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extension = this.getExtension();
	}

	/**
	 * Returns the extension, Size Extension that shows the size of a {TAbstractFile} in the gutter.
	 **/
	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				// search the abstract map for the fileSystemHandler
				const lineForFile = view.state.doc.line(
					view.state.doc.lineAt(line.from).number
				);
				const id = this.plugin.fileSystemHandler.parseAbstractPrefixForId(
					lineForFile.text
				);
				const file = this.plugin.fileSystemHandler.abstractMap.get(id);
				if (file === undefined) {
					return null;
				}
				const bytes = getSizeForAbstractFile(file).toString();
				// convert the bytes into the appropriate unit (KB MB GB)
				const numbytes = parseInt(bytes)

				return new SizeMarker(bytes)
			},
		});
	}
}
