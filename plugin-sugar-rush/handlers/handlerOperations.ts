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
	
	/**
	 * Constructor for the SugarRushOperationHandler class.
	 * Takes in a SugarRushPlugin instance and assigns it to the internal 'plugin' property of the class.
	 * @param {SugarRushPlugin} plugin - An instance of SugarRushPlugin to associate with the SugarRushOperationHandler
	 */

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * The addOperation method accepts an object of type AbstractOperation and adds it to the operations array defined in the SugarRushOperationHandler class.
	 * @param {AbstractOperation} operation - The operation to add to the operations array
	 * @returns {void}
	 */
	addOperation(operation: AbstractOperation) {
		this.operations.push(operation);
	}

	/**
	 * The removeOperation method accepts an object of type AbstractOperation and removes it from the operations array defined in the SugarRushOperationHandler class.
	 * It does this by filtering out the operation to be removed from the current operations array
	 * @param {AbstractOperation} operation - The operation to remove from the operations array
	 * @returns {void}
	 */

	removeOperation(operation: AbstractOperation) {
		this.operations = this.operations.filter((op) => op !== operation);
	}

	/**
	 * The popOperation method is responsible for popping off the last operation from the operations' array, 
	 * provided by the SugarRushOperationHandler class.
	 * If there exists an operation to be popped, the 'run' method of this operation is executed immediately after it's detachment.
	 * @returns {void}
	 */
	
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

