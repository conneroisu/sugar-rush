import type { TAbstractFile } from "obsidian";
import type TSAbstractFile from "./contracts/TSAbstractFile";

	/** 
	 * Generates an abstract prefix for the given file.
	 **/
	export function generateAbstractPrefix(this: any, file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		const absFile = this.plugin.app.vault.getAbstractFileByPath(file.path);
		if (absFile === undefined) {
			return "<a href=" + code + ">" + "</a>";
		}
		this.abstractMap.set(parseInt(code), absFile as TSAbstractFile);
			return "<a href=" + code + ">" + "</a>";
	}

	/** 
	 * Parses the abstract prefix for the id of the file.
	 **/
	export function parseAbstractPrefixForId(line: string): number {
		return parseInt(line.match(/(?<=href=)\w+/)?.toString() ?? "");
	}

