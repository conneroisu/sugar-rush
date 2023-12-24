import type { TAbstractFile } from "obsidian";
import type SugarRushPlugin from "../main";

export default class SugarRushOperationHandler {
	private readonly  plugin: SugarRushPlugin;
	operations: AbstractOperation[] = [];
	sugarReadings: string[] = [];
	operationExceptions: TAbstractFile[] = [];
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	addOperation(operation: AbstractOperation) {
		this.operations.push(operation);
	}

	removeOperation(operation: AbstractOperation) {
		this.operations = this.operations.filter((op) => op !== operation);
	}

	popOperation() {
		this.operations.pop()?.run();
	}

	
}

export abstract class AbstractOperation {
	abstract name: string;
	abstract description: string;
	abstract icon: string;
	abstract id: string;
	abstract plugin: SugarRushPlugin;
	abstract run(): void;
}

