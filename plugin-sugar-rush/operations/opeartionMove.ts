import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { AbstractOperation } from "./AbstractOperation";

export class MoveOperation implements AbstractOperation {
	constructor(plugin : SugarRushPlugin, public path: string, public newPath: string) {this.plugin = plugin;}
    plugin: SugarRushPlugin;
    name: string = "Move";
    description: string = "Moves the file or directory at the given path to the new path";
    icon: string = "move";
    id: string = "move";
    run(): void {
        throw new Error("Method not implemented.");
    }
}

