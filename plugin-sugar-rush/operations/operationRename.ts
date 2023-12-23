import type { TAbstractFile } from "obsidian";
import type { AbstractOperation } from "../contracts/AbstractOperation";


class RenameOperation implements AbstractOperation {
	constructor(public abstractFile: TAbstractFile, public newPath: string) {}
    name: string = "Rename";
    description: string = "Renames the file or directory at the given path to the new path";
    icon: string = "rename";
    id: string = "rename";
    run(): void {
        throw new Error("Method not implemented.");
    }
}


