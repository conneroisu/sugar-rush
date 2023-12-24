import type SugarRushPlugin from "./main";
import type { AbstractOperation } from "./contracts/AbstractOperation";

export default class SugarRushOperationHandler {
	private plugin: SugarRushPlugin;
	private operations: AbstractOperation[] = [];
	
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
