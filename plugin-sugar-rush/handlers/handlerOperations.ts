import type { TAbstractFile } from "obsidian";
import type SugarRushPlugin from "../main";

/**
 * A handler class that manages, organizes and manipulates operations in the SugarRush Plugin environment.
 * It adds, removes and pops off the operations in the operations' stack.
 * @property {SugarRushPlugin} plugin - A read-only property defining the SugarRush plugin instance this handler is associated with
 * @property {AbstractOperation[]} operations - An array holding the operations which this handler is currently managing
 * @property {string[]} sugarReadings - An array holding the sugar readings
 * @property {TAbstractFile[]} operationExceptions - An array storing encountered operation exceptions.
 * @constructor {SugarRushOperationHandler} constructor - Constructs a new handler instance, taking a SugarRushPlugin instance as a required parameter
 * @method {void} addOperation - Accepts an operation of type AbstractOperation, pushes it into the operations array
 * @method {void} removeOperation - Accepts an operation of type AbstractOperation, removes it from the operations' array
 * @method {void} popOperation - Pops off the last operation in the operations' stack and then runs that operation
 **/
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

