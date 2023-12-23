import type { AbstractOperation } from "../contracts/AbstractOperation";


class CreateOperation implements AbstractOperation {
	constructor(public path: string) {}
    name: string = "Create";
    description: string = "Creates a new file or directory at the given path";
    icon: string = "create";
    id: string = "create";
    run(): void {
        throw new Error("Method not implemented.");
    }
}
