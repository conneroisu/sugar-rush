import type { FileStats, TFile, TFolder, Vault } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export class SugarFile implements TFile {
	stat: FileStats;
	basename: string;
	extension: string = "sugar"
	vault: Vault;
	path: string;
	name: string;
	parent: TFolder | null;
	
	constructor(plugin: SugarRushPlugin, public abstractFile: TFile) {
		this.vault = plugin.app.vault;
		this.path = abstractFile.path;
		this.name = abstractFile.name;
		this.basename = abstractFile.basename;
		this.parent = abstractFile.parent;
		this.stat = abstractFile.stat;
	}

}
