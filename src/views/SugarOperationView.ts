import { App, Modal } from "obsidian";
import type { AbstractOperation } from "src/operations/AbstractOperation";

export class SugarOperationModal extends Modal {
	operations: AbstractOperation[];
	constructor(app: App, operations: AbstractOperation[]) {
		super(app);
		this.operations = operations;
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.createEl("h1", { text: "Operation View" });

		// create a list of operations
		for (let operation of this.operations) {
			contentEl.createEl("h2", { text: operation.name });
			contentEl.createEl("p", { text: operation.description });
		}

		const acceptButton = contentEl.createEl("button", { text: "Accept" });
		const cancelButton = contentEl.createEl("button", { text: "Cancel" });

		cancelButton.addEventListener("click", () => {
			this.close();
		});
		acceptButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
