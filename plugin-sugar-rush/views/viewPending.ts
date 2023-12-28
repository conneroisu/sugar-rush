import { Modal } from "obsidian";
import { AbstractOperation } from "plugin-sugar-rush/contracts/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * SugarRushPendingView class inherits from Modal.
 * This class is responsible for creating and managing a Pending Operations modal view.
 * @class
 * @extends Modal
 * @property {AbstractOperation[]} operations - An array of AbstractOperation.
 * @constructor
 * @param {App} app - The Obsidian application object.
 * @param {AbstractOperation[]} operations - An array of operations to be displayed in the modal view.
 * @method onOpen - Overrides Modal's onOpen method.Populates table of operations and populates footer with buttons.
 * @method onClose - Overrides Modal's onClose method. It clears the contentEl of the modal.
 **/
export class SugarRushPendingView extends Modal {
	operations!: AbstractOperation[];
	
	/**
	 * Constructs an instance of SugarRushPendingView with specified application object and operations.
	 *
	 * @constructor
	 * @param {SugarRushPlugin} plugin - An instance of SugarRushPlugin.
	 **/
	constructor(plugin: SugarRushPlugin) {
		super(plugin.app);
	}

	/**
	 * On the opening of the modal.
	 **/
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
	 * On the closing of the modal.
	 **/
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
