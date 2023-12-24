import type { AbstractOperation } from "plugin-sugar-rush/contracts/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";


export class DeleteOperation implements AbstractOperation {
	constructor(plugin: SugarRushPlugin, public path: string) { this.plugin = plugin; }
	name: string = "Delete";
	description: string = "Deletes the file or directory at the given path";
	icon: string = "delete";
	id: string = "delete";
	plugin: SugarRushPlugin;
	run(): void {
		throw new Error("Method not implemented.");
	}

}
