import type { AbstractOperation } from "plugin-sugar-rush/operations/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { TAbstractFile } from "obsidian";


export class DeleteOperation implements AbstractOperation {
	constructor(plugin: SugarRushPlugin, public path: string) { 
		this.plugin = plugin; 
		const result = this.plugin.app.vault.getAbstractFileByPath(this.path);
		if(result){
			this.file = result;
		}
	}
	file!: TAbstractFile;
	name: string = "Delete";
	description: string = "Deletes the file or directory at the given path";
	icon: string = "delete";
	id: string = "delete";
	plugin: SugarRushPlugin;
	run(): void {
		// get teh abstract file at the path
		if (this.file) {
			this.plugin.app.vault.delete(this.file);
		}
	}

}
