
import { TAbstractFile, FileManager } from "obsidian";

// Use a Discriminated Union to define the types of operations that can be performed on the file system
type SystemOperation = CreateOperation | DeleteOperation | RenameOperation | MoveOperation;

// Defines the operations that can be performed on the file system (e.g. create, delete, rename, and move)
class CreateOperation {
	constructor(public path: string) {}

	// Creates a file or directory at the given path
	perform() {
		// ...
	}
}

class DeleteOperation {
	constructor(public path: string) {}

	// Deletes the file or directory at the given path
	perform() {
		// ...
	}
}

class RenameOperation {
	constructor(public abstractFile: TAbstractFile, public newPath: string) {}

	// Renames the file or directory at the given path
	perform() {
		// ...
	}
}

class MoveOperation {
	constructor(public path: string, public newPath: string) {}

	// Moves the file or directory at the given path to the new path
	perform() {
		// ...
	}
}

