import { Modal } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/** 
 * View that displays the operations that are pending
 * @extends Modal
 **/
export class SugarRushOperationView extends Modal {

	/**
	 * Constructor for the class
	 * @param {SugarRushPlugin} plugin - instance of the plugin class
	 * @returns {SugarRushOperationView} - instance of the class
	 **/
	constructor(plugin: SugarRushPlugin) {
		super(plugin.app);
	}

	/**
	 * Returns the operations that are pending
	 **/
	getOperations(): (Operation[]) {
		return [];
	}

	/** 
	 * Routine that runs on the opening of the view
	 **/
	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Operation View" });

		const operations = this.getOperations();
		if (operations.length === 0) {
			contentEl.createEl("p", { text: "There are no operations pending." });
		}else{
			for (const operation of operations) {
				contentEl.createEl("h2", { text: operation.id });
				contentEl.createEl("p", { text: operation.description });
			}
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

	/**
	 * Rotine thatrns on the closing of the view
	 **/
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
