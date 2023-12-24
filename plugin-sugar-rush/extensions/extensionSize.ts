import { gutter, GutterMarker } from "@codemirror/view";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as fs from "fs";

export function getSizeForAbstractFile(file: TFile | TFolder) {
	if (file instanceof TFile) {
		return file.stat.size;
	}

	if (file instanceof TFolder) {
		let sum = 0;
		file.children.forEach((child) => {
			if (child instanceof TFile) {
				const res = getSizeForAbstractFile(child);
				if (res) {
					sum += res;
				}
			}else if (child instanceof TFolder) {
				const res = getSizeForAbstractFile(child);
				if (res) {
					sum += res;
				}
			}
		});
		
		return sum;
	}
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
