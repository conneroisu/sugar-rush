import { TFolder, type TAbstractFile, TFile, type Vault, WorkspaceLeaf } from "obsidian";
import type SugarRushPlugin from "./main";
import { sep } from "path";

export default class SugarRushFileSystemHandler {
	private vault: Vault;
	private plugin: SugarRushPlugin;
	abstractMap!: Map<number, TAbstractFile>;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
		this.abstractMap = new Map();
	}

	getSugarFilePath(activeFile: TFile): string {
		if (activeFile.parent === null) {

			return (
				this.plugin.settings.sugarFolder +
				"/" +
				"root" +
				".sugar" 
			);
		}
		return (
			this.plugin.settings.sugarFolder +
			"/" +
			activeFile.parent.path.replace(sep, "-") +
			".sugar" 
		);
	}

	async createSugarFile(activeFile: TFile): Promise<TFile> {
		this.ensureSugarFolder();
		let isExistingFile: boolean = false;
		if (this.isSugarFile(activeFile)) {
			// create the active files path 
			return await this.vault.create(activeFile.path + 'adsfadsj.md', this.generateSugarFileContent(activeFile));

		} else {
			return await this.vault.create(
				this.getSugarFilePath(activeFile),
				this.generateSugarFileContent(activeFile)
			);
		}
	}


	private generateSugarFileContent(activeFile: TFile): string {
		return this.GetParentChildren(activeFile).map((file) => {
			return this.generate_prefix(file) + file.name;
		}).join("\n")
	}

	private ensureSugarFolder() {
		if (!this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder)) {
			this.vault.createFolder(this.plugin.settings.sugarFolder);
		}
	}

	deleteSugarFolder() {
		const folder = this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder);
		if (folder) {
			this.vault.delete(folder, true);
		}
	}

	private GetParentChildren(file: TAbstractFile): TAbstractFile[] {
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
		leaf.openFile(file);
		this.plugin.activateIconExtension();
	}

	checkFocusAway() {
	}

	generate_prefix(file: TAbstractFile): string {
		if (file instanceof TFile) {

			return (
				"<a href=" +
				Math.random().toString(5).substring(2, 7) +
				">" +
				"</a>"
			);
		}
		return (
			"<a href=" +
			Math.random().toString(5).substring(2, 7) +
			">" +
			"</a>"
		);
	}

	isSugarFile(activeFile: TFile): boolean {
		if (activeFile.parent?.path === this.plugin.settings.sugarFolder) {
			return true;
		}
		return false;
	}
}
