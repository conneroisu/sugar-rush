import { sep } from "path";
import { type TAbstractFile, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import type TSAbstractFile from "plugin-sugar-rush/contracts/TSAbstractFile";
import { generateAbstractPrefix } from "plugin-sugar-rush/utils";
import type { AbstractOperation } from "./contracts/AbstractOperation";
import type SugarRushPlugin from "./main";
import { SugarRushOperationView } from "./views/viewOperation";

/** 
 * The `SugarRushFileSystemHandler` class is responsible for handling all file system related operations.
 * 
 * @property {SugarRushPlugin} plugin - An instance of 'SugarRushPlugin', which will be used.
 * @property {Map<number, TAbstractFile>} abstractMap - A map of abstract file ids to their respective files.
 * 
 * @method openSugarOperationViewModal - Opens the operation view modal.
 * @method getAllSugarFiles - Returns all sugar files in the vault.
 * @method deleteAllSugarFiles - Deletes all sugar files in the vault.
 * @method loadRegularFile - Loads a regular file.
 * @method loadSugarFile - Loads a sugar file.
 * @method getSugarFilePath - Returns the path of the sugar file for the given file.
 * @method createSugarFile - Creates a sugar file for the given file.
 * @method generateSugarFileContent - Generates the content for a sugar file for the given file.
 * @method getParentChildren - Returns the children of the parent of the given file.
 * @method isSugarFile - Returns true if the given file is a sugar file.
 **/
export default class SugarRushFileSystemHandler {
	private readonly plugin: SugarRushPlugin;
	abstractMap: Map<number, TSAbstractFile> = new Map();
	operations: Map<number, AbstractOperation> = new Map();

	/** 
	 * Creates a new File System Handler.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.deleteAllSugarFiles()
	}

	/**
	 * The refreshSugarFile method is responsible for refreshing the sugar file for the given file.
	 * @param {TFile} activeFile - The file to refresh the sugar file for.
	 * @param {WorkspaceLeaf} leaf - The leaf to refresh the sugar file for.
	 * @returns {void}
	 **/
	refreshSugarFile(activeFile: TFile, leaf: WorkspaceLeaf): void {
		this.plugin.app.vault
			.modify(activeFile, this.generateSugarFileContent(activeFile))
			.then(() => {
				if (this.plugin.settings.debug) {
					console.log("Refreshed file", activeFile);
				}
				this.loadSugarFile(activeFile, leaf);
			});
	}

	/** 
	 * Opens a modal for the operation view with all operations.
	 **/
	openSugarOperationViewModal(): void {
		new SugarRushOperationView(this.plugin).open();
	}

	/** 
	 * Returns all sugar files in the vault. (All .sugar files)
	 **/
	getAllSugarFiles() {
		const sugarFiles: TFile[] = [];
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.plugin.app.vault.getFiles().forEach((file) => {
			if (file.extension === "sugar") {
				sugarFiles.push(file);
			}
		});
		return sugarFiles;
	}


	/** 
	 * Generates an abstract prefix for the given file.
	 **/
	generateAbstractPrefix(file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		const absFile = this.plugin.app.vault.getAbstractFileByPath(file.path);
		if (absFile) {
			// convert the absFile to a TSAbstractFile
			this.abstractMap.set(parseInt(code), );
		}
		return "<a href=" + code + ">" + "</a>";
	}

	/** 
	 * Parses the abstract prefix for the id of the file.
	 **/
	parseAbstractPrefixForId(line: string): number {
		return parseInt(line.match(/(?<=href=)\w+/)?.toString() ?? "");
	}

	/** 
	 * Deletes all sugar files in the vault. (All .sugar files)
	 **/
	deleteAllSugarFiles() {
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.getAllSugarFiles().forEach((file) => {
			this.plugin.app.vault.delete(file).then(() => {
				if (this.plugin.settings.debug) {
					console.log("Deleted file", file);
				}
			});
		});
	}

	/** 
	 * Loads a regular file.
	 **/
	loadRegularFile(file: TFile, leaf: WorkspaceLeaf): void {
		leaf.openFile(file);
		this.plugin.extensionHandler.clearExtensions();
		this.plugin.app.workspace.updateOptions();
	}

	/** 
	 * Loads a sugar file.
	 **/
	loadSugarFile(file: TFile, leaf: WorkspaceLeaf): void {
		leaf.openFile(file);
		this.plugin.extensionHandler.getExtensions();
		this.plugin.app.workspace.updateOptions();
	}

	/** 
	 * Returns the path of the sugar file for the given file.
	 **/
	getSugarFilePath(activeFile: TFile): string {
		if (activeFile.parent && (activeFile.parent.path === "/" || activeFile.parent === null)) {
			return "root" + ".sugar";
		}
		return (
			activeFile.parent?.path +
			sep +
			activeFile.parent?.name.replace(sep, "-") +
			".sugar"
		);
	}

	/** 
	 * Creates a sugar file for the given file.
	 **/
	async createSugarFile(activeFile: TFile): Promise<TFile> {
		return await this.plugin.app.vault.create(
			this.getSugarFilePath(activeFile),
			this.generateSugarFileContent(activeFile)
		);
	}

	/** 
	 * Generates the content for a sugar file for the given file.
	 **/
	generateSugarFileContent(activeFile: TFile): string {
		return this.getParentChildren(activeFile)
			.map((file) => {
				if (file instanceof TFolder) {
					return generateAbstractPrefix(file) + file.name + "/";
				}
				return generateAbstractPrefix(file) + file.name;
			})
			.join("\n");
	}

	/** 
	 * Returns the children of the parent of the given file.
	 **/
	getParentChildren(file: TAbstractFile): TAbstractFile[] {
		if (file instanceof TFolder) {
			return file.children;
		}
		if (file instanceof TFile) {
			if (file.parent === null) {
				return this.plugin.app.vault.getRoot().children;
			}
			return file.parent.children;
		}
		return [];
	}

	/** 
	 * Returns true if the given file is a sugar file.
	 **/
	isSugarFile(activeFile: TFile): boolean {
		if (activeFile.extension === "sugar") {
			return true;
		}
		return false;
	}
}
