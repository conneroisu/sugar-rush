import { sep } from "path";
import { type TAbstractFile, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import type SugarRushPlugin from "./main";
import type AbstractOperation from "./operations/AbstractOperation";

/**
 * The `SugarRushFileSystemHandler` class is responsible for handling all file system related operations.
 *
 * @property {SugarRushPlugin} plugin - An instance of 'SugarRushPlugin', which will be used.
 * @property {Map<number, TAbstractFile>} abstractMap - A map of abstract file ids to their respective files.
 *
 * @method openSugarOperationViewModal - Opens the operation view modal.
 * @method getAllSugarFiles - Returns all sugar files in the vault.
 * @method deleteAllSugarFiles - Deletes all sugar files in the vault.
 * @method loadFile - Loads file into the view.
 * @method createSugarFile - Creates a sugar file for the given file.
 * @method generateSugarFileContent - Generates the content for a sugar file for the given file.
 * @method getParentChildren - Returns the children of the parent of the given file.
 **/
export default class SugarRushFileSystemHandler {
	private readonly plugin: SugarRushPlugin;
	abstractMap: Map<number, TAbstractFile> = new Map();
	operationsMap: Map<number, AbstractOperation> = new Map();
	pendingOperations: Map<number, AbstractOperation> = new Map();

	/**
	 * Creates a new File System Handler.
	 * @param plugin - An instance of 'SugarRushPlugin', which will be used.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.removeAllSugarFiles();
	}

	/**
	 * Returns all sugar files in the vault. (All .sugar files)
	 * @returns {TFile[]} - All sugar files in the vault.
	 **/
	getAllSugarFiles(): TFile[] {
		console.log("| getAllSugarFiles | getting all sugar files");
		const sugarFiles: TFile[] = [];
		for (const file of this.plugin.app.vault.getFiles()) {
			if (file.extension === "sugar") {
				sugarFiles.push(file);
			}
		}
		return sugarFiles;
	}

	/**
	 * Generates an abstract prefix for the given file.
	 * @param file - The file to generate the abstract prefix for.
	 **/
	generateAbstractPrefix(file: TAbstractFile): string {
		console.log("| generateAbstractPrefix | generating abstract prefix for file: ", file);
		const code = Math.random().toString(5).substring(2, 7);
		this.abstractMap.set(parseInt(code), file);
		return `<a href=${code}></a>`;
	}

	/**
	 * Deletes all sugar files in the vault. (All .sugar files)
	 **/
	removeAllSugarFiles() {
		console.log("| removeAllSugarFiles | removing all sugar files at date: ", new Date());
		for (const file of this.getAllSugarFiles()) {
			this.plugin.app.vault.delete(file).then(() => {
				if (this.plugin.settings.debug) {
					console.log("Deleted file", file);
				}
			});
		}
	}

	/**
	 * Loads file into the view.
	 * @param file - The file to load into the view.
	 * @param leaf - The leaf to load the file into.
	 **/
	loadFile(file: TFile, leaf: WorkspaceLeaf): void {
		leaf.openFile(file);
		if (file.extension === "sugar") {
			this.plugin.getExtensions();
		} else {
			this.plugin.clearExtensions();
		}
		this.plugin.app.workspace.updateOptions();
	}

	async getSugarFileForFile(file: TFile): Promise<TFile> {
		const sugarFilePath = this.getSugarFilePath(file);
		const sugarFile = this.plugin.app.vault.getAbstractFileByPath(sugarFilePath);
		if (sugarFile) {
			if (sugarFile instanceof TFile) {
				return sugarFile;
			}
		}
		return await this.createSugarFile(file);
	}

	/**
	 * Creates a sugar file for the given file with the sugar files's content.
	 * @param {TFile} activeFile - the file to create the sugar file for
	 * @returns {TFile} - the created sugar file
	 **/
	async createSugarFile(activeFile: TFile): Promise<TFile> {
		console.log("| createSugarFile | creating sugar file for file: ", activeFile);
		const sugarFile = await this.plugin.app.vault.create(
			this.getSugarFilePath(activeFile),
			"",
		);
		this.plugin.app.vault.modify(
			sugarFile,
			this.generateSugarFileContent(sugarFile),
		);
		return sugarFile;
	}

	/**
	 * Returns the path of the sugar file for the given file.
	 * @param activeFile - the file to get the sugar file path for
	 **/
	getSugarFilePath(activeFile: TFile): string {
		console.log("| getSugarFilePath | getting sugar file path for file: ", activeFile);
		if (activeFile.parent && activeFile.parent.path === "/") {
			return "root" + ".sugar";
		}
		return `${activeFile.parent?.path + sep + activeFile.parent?.name.replace(sep, "-")
			}.sugar`;
	}
	/**
	 * Generates the content for a sibling sugar file for the given file.
	 * @param {TFile} activeFile - the file to generate the sugar file content for
	 * @returns {string} - the generated sugar file content
	 **/
	generateSugarFileContent(activeFile: TFile): string {
		console.log("| generateSugarFileContent | generating sugar file content for file: ", activeFile);
		return this.getParentChildren(activeFile)
			.map((file) => {
				if (file instanceof TFolder) {
					return `${this.generateAbstractPrefix(file) + file.name}/`;
				}
				return this.generateAbstractPrefix(file) + file.name;
			})
			.join("\n");
	}

	/**
	 * Gets the sugar file content for a sugar file given the {TFile} object of the sugar file.
	 * @param {TFile} sugarFile - the TFile for the sugar file to get the content for.
	 **/
	getSugarFileContent(sugarFile: TFile): string {
		console.log("| getSugarFileContent | getting contents for sugar file with path: ", sugarFile.path);
		const parentChildren = this.getParentChildren(sugarFile)
			.map((file) => {
				if (file instanceof TFolder) {
					return `${this.generateAbstractPrefix(file) + file.name}/`;
				}
				return this.generateAbstractPrefix(file) + file.name;
			})
			.join("\n");

		return parentChildren;
	}

	/**
	 * Returns the children of the parent of the given file.
	 * @param {TAbstractFile} abstractFile -the returned  parent's children are of this file
	 **/
	getParentChildren(abstractFile: TAbstractFile): TAbstractFile[] {
		console.log("| getParentChildren | getting parent children for file: ", abstractFile);
		if (abstractFile instanceof TFolder) {
			return abstractFile.children;
		}
		if (abstractFile instanceof TFile) {
			if (abstractFile.parent === null) {
				return this.plugin.app.vault.getRoot().children;
			}
			return abstractFile.parent.children;
		}
		return [];
	}
}
