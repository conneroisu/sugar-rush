import { App, Modal } from "obsidian";
import { type AbstractOperation } from "../handlers/handlerOperations";

export class SugarRushPendingView extends Modal {
	operations: AbstractOperation[];
	
	constructor(app: App, operations: AbstractOperation[]) {
		super(app);
		this.operations = operations;
	}

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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
