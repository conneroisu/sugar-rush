import { App, Modal } from "obsidian";

export class SugarOperationModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText("Look at me, I'm a modal! 👀");
		contentEl.createEl("h1", { text: "Hello World!" });
		// create a button
		
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
