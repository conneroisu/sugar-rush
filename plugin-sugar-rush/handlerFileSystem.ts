import { TFolder, type TAbstractFile, TFile, type Vault, WorkspaceLeaf } from "obsidian";
import type { AbstractOperation } from "./operations/AbstractOperation";
import { SugarOperationModal } from "./operationModal";
import { sep } from "path";

import type SugarRushPlugin from "./main";

export default class SugarRushFileSystemHandler {
	vault: Vault;
	plugin: SugarRushPlugin;
	abstractMap: Map<number, TAbstractFile> = new Map();
	operations: AbstractOperation[] = [];

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
	}

	loadRegularFile(file: TFile, leaf: WorkspaceLeaf) {
		leaf.openFile(file);
		this.plugin.extensionHandler.clearExtensions();
		this.plugin.app.workspace.updateOptions();
	}


	loadSugarFile(file: TFile, leaf: WorkspaceLeaf) {
		console.log("loadSugarFile: active file path: " + file.path);
		leaf.openFile(file);
		this.plugin.extensionHandler.collectExtensions();
		this.plugin.app.workspace.updateOptions();
	}

	openSugarOperationViewModal() {
		new SugarOperationModal(this.plugin.app, this.operations).open();
	}

	getSugarFilePath(activeFile: TFile): string {
		if (activeFile.parent && (activeFile.parent.path === "/" || activeFile.parent === null)) {
			return (
				"root" +
				".sugar"
			);
		}
		if (this.isSugarFile(activeFile)) {
			// return the path of a suar file in the parent parent folder
			if (activeFile.parent?.parent?.path) {
				return (
					activeFile.parent?.parent?.path +
					sep +
					activeFile.parent?.parent?.name.replace(sep, "-") +
					".sugar"
				);
			}

		}
		return (
			activeFile.parent?.path + sep +
			activeFile.parent?.name.replace(sep, "-") + ".sugar"
		);
	}

	async createSugarFile(activeFile: TFile): Promise<TFile> {
		return await this.vault.create(
			this.getSugarFilePath(activeFile),
			this.generateSugarFileContent(activeFile)
		);
	}


	generateSugarFileContent(activeFile: TFile): string {
		return this.GetParentChildren(activeFile).map((file) => {
			if (file instanceof TFolder) {
				return this.generate_prefix(file) + file.name + "/";
			}
			return this.generate_prefix(file) + file.name;
		}).join("\n")
	}


	GetParentChildren(file: TAbstractFile): TAbstractFile[] {
		if (file instanceof TFolder) {
			return file.children;
		} else if (file instanceof TFile) {
			if (file.parent === null) {
				return this.plugin.app.vault.getRoot().children;
			} else {
				return file.parent.children;
			}
		}
		return [];
	}

	generate_prefix(file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		this.abstractMap.set(parseInt(code), file);
		return (
			"<a href=" +
			code +
			">" +
			"</a>"
		);
	}

	isSugarFile(activeFile: TFile): boolean {
		if (activeFile.extension === "sugar") {
			return true;
		}
		return false;
	}


}
