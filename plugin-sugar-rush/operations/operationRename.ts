import type { TAbstractFile } from "obsidian";
import type { AbstractOperation } from "../contracts/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";


export class RenameOperation implements AbstractOperation {
	constructor(plugin: SugarRushPlugin, public abstractFile: TAbstractFile, public newPath: string) {this.plugin = plugin;}
    name: string = "Rename";
    description: string = "Renames the file or directory at the given path to the new path";
    icon: string = "rename";
    id: string = "rename";
	plugin: SugarRushPlugin;
    run(): void {
		this.plugin.app.vault.rename(this.abstractFile, this.newPath);
    }
}


