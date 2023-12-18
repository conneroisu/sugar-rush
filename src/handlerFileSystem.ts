import { TFolder, type TAbstractFile, TFile, type Vault, WorkspaceLeaf } from "obsidian";
import type { AbstractOperation } from "./operations/AbstractOperation";
import { SugarOperationModal } from "./views/SugarOperationView";
import { sep } from "path";

import type SugarRushPlugin from "./main";
import iconGutter from "./extensionIcons";

export default class SugarRushFileSystemHandler {
	private vault: Vault;
	private plugin: SugarRushPlugin;
	abstractMap!: Map<number, TAbstractFile>;
	operations!: AbstractOperation[];

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
		this.abstractMap = new Map();
		const folder = this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder);
		if (folder) {
			this.vault.delete(folder, true);
		}
	}

	loadRegularFile(file: TFile, leaf: WorkspaceLeaf) {
		leaf.openFile(file);
		this.plugin.extension = [];
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
		if (activeFile.parent === null) {
			return (
				"root" +
				".sugar"
			);
		}
		return (
			activeFile.parent.path +
			sep +
			activeFile.parent.name.replace(sep, "-") +
			".sugar"
		);
	}

	async createSugarFile(activeFile: TFile): Promise<TFile> {
		this.ensureSugarFolder();
		return await this.vault.create(
			this.getSugarFilePath(activeFile),
			this.generateSugarFileContent(activeFile)
		);

	}


	private generateSugarFileContent(activeFile: TFile): string {
		console.log("generateSugarFileContent: active file path: " + activeFile.path);
		return this.GetParentChildren(activeFile).map((file) => {
			if (file instanceof TFolder) {
				return this.generate_prefix(file) + file.name + "/";
			}
			return this.generate_prefix(file) + file.name;
		}).join("\n")
	}

	private ensureSugarFolder() {
		console.log("ensureSugarFolder: sugar folder: " + this.plugin.settings.sugarFolder);
		if (!this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder)) {
			this.vault.createFolder(this.plugin.settings.sugarFolder);
		}
	}

	GetParentChildren(file: TAbstractFile): TAbstractFile[] {
		console.log("GetParentChildren: active file path: " + file.path);
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

	loadSugarFile(file: TFile, leaf: WorkspaceLeaf) {
		console.log("loadSugarFile: active file path: " + file.path);
		leaf.openFile(file);
		this.plugin.extension = iconGutter();
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
