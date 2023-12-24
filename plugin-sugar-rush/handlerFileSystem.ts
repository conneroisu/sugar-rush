import { TFolder, type TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
import { SugarOperationModal } from "./views/operationModal";
import { sep } from "path";

import type SugarRushPlugin from "./main";

export default class SugarRushFileSystemHandler {
	private plugin: SugarRushPlugin;
	private abstractMap: Map<number, TAbstractFile> = new Map();

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	openSugarOperationViewModal() {
		new SugarOperationModal(this.plugin.app, this.plugin.operationHandler.operations).open();
	}

	getAllSugarFiles() {
		let sugarFiles: TFile[] = [];
		this.plugin.app.vault.getFiles().forEach((file) => {
			if (file.extension === "sugar") {
				sugarFiles.push(file);
			}
		});
		return sugarFiles;
	}
	
	deleteAllSugarFiles() {
		this.getAllSugarFiles().forEach((file) => {
			this.plugin.app.vault.delete(file);
		});
	}

	loadRegularFile(file: TFile, leaf: WorkspaceLeaf) {
		leaf.openFile(file);
		this.plugin.extensionHandler.clearExtensions();
		this.plugin.app.workspace.updateOptions();
	}

	loadSugarFile(file: TFile, leaf: WorkspaceLeaf) {
		leaf.openFile(file);
		this.plugin.extensionHandler.getExtensions();
		this.plugin.app.workspace.updateOptions();
	}


	getSugarFilePath(activeFile: TFile): string {
		if (activeFile.parent && (activeFile.parent.path === "/" || activeFile.parent === null)) {
			return (
				"root" +
				".sugar"
			);
		}
		return (
			activeFile.parent?.path + sep +
			activeFile.parent?.name.replace(sep, "-") + ".sugar"
		);
	}

	async createSugarFile(activeFile: TFile): Promise<TFile> {
		return await this.plugin.app.vault.create(
			this.getSugarFilePath(activeFile),
			this.generateSugarFileContent(activeFile)
		);
	}

	generateSugarFileContent(activeFile: TFile): string {
		return this.getParentChildren(activeFile).map((file) => {
			if (file instanceof TFolder) {
				return this.generateAbstractPrefix(file) + file.name + "/";
			}
			return this.generateAbstractPrefix(file) + file.name;
		}).join("\n")
	}

	getParentChildren(file: TAbstractFile): TAbstractFile[] {
		if (file instanceof TFolder) { return file.children; }
		if (file instanceof TFile) {
			if (file.parent === null) {
				return this.plugin.app.vault.getRoot().children;
			}
			return file.parent.children;
		}
		return [];
	}

	generateAbstractPrefix(file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		this.abstractMap.set(parseInt(code), file);
		return ("<a href=" + code + ">" + "</a>");
	}

	isSugarFile(activeFile: TFile): boolean {
		if (activeFile.extension === "sugar") { return true; }
		return false;
	}
}
