import { App, Modal } from "obsidian";
import { type AbstractOperation } from "../handlers/handlerOperations";



/**
 * SugarRushPendingView class inherits from Modal.
 * This class is responsible for creating and managing a Pending Operations modal view.
 *
 * @class
 * @extends Modal
 * @property {AbstractOperation[]} operations - An array of AbstractOperation.
 *
 * @constructor
 * @param {App} app - The Obsidian application object.
 * @param {AbstractOperation[]} operations - An array of operations to be displayed in the modal view.
 *
 * @method onOpen - Overrides Modal's onOpen method.
 * It populates the contentEl of the modal with HTML elements representing the pending operations.
 * It also creates "Minimize" and "Cancel" buttons with listeners that call the close method.
 *
 * @method onClose - Overrides Modal's onClose method.
 * It clears the contentEl of the modal.
 */

export class SugarRushPendingView extends Modal {
	operations: AbstractOperation[];
	
	/**
	 * Constructs an instance of SugarRushPendingView with specified application object and operations.
	 *
	 * @constructor
	 * @param {App} app - The Obsidian application object provided for the super Modal class.
	 * @param {AbstractOperation[]} operations - An array of operations to be rendered in the modal view.
	 */

	constructor(app: App, operations: AbstractOperation[]) {
		super(app);
		this.operations = operations;
	}

	/**
	 * This method overrides Modal's onOpen method and is responsible for populating the contentEl of the modal with HTML elements
	 * representing the pending operations. It generates an 'h1' header with text 'Pending Operations', then iterates over the
	 * operations array creating an 'h2' header and a paragraph 'p' for each operation, where 'h2' contains the operation name and
	 * the paragraph holds the operation description. Also, it creates two buttons 'Minimize' and 'Cancel' with listeners assigned to each
	 * one of them. Both listeners call the close method, which closes the modal.
	 */

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Pending Operations" });

		for (const operation of this.operations) {
			contentEl.createEl("h2", { text: operation.name });
			contentEl.createEl("p", { text: operation.description });
		}

		const minimizeButton = contentEl.createEl("button", { text: "Minimize" });
		const cancelButton = contentEl.createEl("button", { text: "Cancel" });

		cancelButton.addEventListener("click", () => {
			this.close();
		});
		
		minimizeButton.addEventListener("click", () => {
			this.close();
		});
	}

	/**
	 * This method overrides Modal's onClose method. It's responsible for clearing the contentEl of the modal,
	 * essentially removing all HTML elements previously populated by the onOpen method.
	 */
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
