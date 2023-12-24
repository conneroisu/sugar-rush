import type { FileStats, TFile, TFolder, Vault } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export class SugarFile implements TFile {
	extension: string = "sugar"
	vault: Vault;
	basename: string;
	path: string;
	name: string;
	parent: TFolder | null = null;
	
	stat: FileStats = {
		ctime: new Date().getTime(),
		mtime: new Date().getTime(),
		size: 0
	}
	
	constructor(plugin: SugarRushPlugin, ) {
		this.vault = plugin.app.vault;
	}

	

}
