import { Modal } from "obsidian";
import { AbstractOperation } from "plugin-sugar-rush/contracts/AbstractOperation";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export class SugarRushOperationView extends Modal {
	operations!: AbstractOperation[];
	
	constructor(plugin: SugarRushPlugin) {
		super(plugin.app);
	}

	getOperations(): AbstractOperation[] {
		return [];
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
