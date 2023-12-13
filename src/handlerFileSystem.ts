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
				".sugar" +
				".md"
			);
		}
		return (
			this.plugin.settings.sugarFolder +
			"/" +
			activeFile.parent.path.replace(sep, "-") +
			".sugar" +
			".md"
		);
	}

	createSugarFile(activeFile: TFile, leaf: WorkspaceLeaf) {
		this.ensureSugarFolder();
		if (this.isSugarFile(activeFile)) {
			// create the active files path 

		} else {
			const file = this.vault.create(
				this.getSugarFilePath(activeFile),
				this.GetParentChildren(activeFile).map((file) => { return file.name; }).join("\n")
			);
			this.loadToActiveView(file, leaf);
		}
	}

	private async loadToActiveView(file: Promise<TFile>, activeView: WorkspaceLeaf) {
		const rfile = await file;
		activeView.openFile(rfile);
	}

	private ensureSugarFolder() {
		if (!this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder)) {
			this.vault.createFolder(this.plugin.settings.sugarFolder);
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

	generate_prefix(file: TFile): string {
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
