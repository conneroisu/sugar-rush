import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { AbstractOperation } from "../contracts/AbstractOperation";


export class CreateOperation implements AbstractOperation {
	private plugin: SugarRushPlugin;
	constructor(plugin: SugarRushPlugin, public path: string) {this.plugin = plugin;}
    name: string = "Create";
    description: string = "Creates a new file or directory at the given path";
    icon: string = "create";
    id: string = "create";
    run(): void {
		this.plugin.app.vault.create(this.path, "");
		
    }
}
