import { App, Modal } from "obsidian";

export class SugarOperationModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Look at me, I'm a modal! 👀");
		contentEl.createEl("h1", {text: "Hello World!"});
		// create a button
		const button = contentEl.createEl("button", {text: "Click Me!"});
		button.addEventListener("click", () => {
		this.close();
		});
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
