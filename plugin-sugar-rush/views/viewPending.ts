import { App, Modal } from "obsidian";
import { type AbstractOperation } from "./operations/AbstractOperation";

export default class ViewPending extends Modal {
	
}


export class SugarRushPendingView extends Modal {
	operations: AbstractOperation[];
	
	constructor(app: App, operations: AbstractOperation[]) {
		super(app);
		this.operations = operations;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Operation View" });

		// create a list of operations
		for (const operation of this.operations) {
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
		const { contentEl } = this;
		contentEl.empty();
	}
}
