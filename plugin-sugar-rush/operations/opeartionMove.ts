import type { AbstractOperation } from "../contracts/AbstractOperation";

export class MoveOperation implements AbstractOperation {
	constructor(public path: string, public newPath: string) {}
    name: string = "Move";
    description: string = "Moves the file or directory at the given path to the new path";
    icon: string = "move";
    id: string = "move";
    run(): void {
        throw new Error("Method not implemented.");
    }
}

