import { Modal } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import type { CreateOperation } from "./operations/operationCreate";
import type { MoveOperation } from "./operations/operationMove";
import type { RenameOperation } from "./operations/operationRename";
import type { DeleteOperation } from "./operations/operationDelete";

/** 
 * View that displays the operations that are pending
 **/
export class SugarRushOperationView extends Modal {

	constructor(plugin: SugarRushPlugin) {
		super(plugin.app);
	}

	getOperations(): (CreateOperation | MoveOperation | RenameOperation | DeleteOperation | []) {
		return [];
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Operation View" });

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
