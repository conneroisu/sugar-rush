import { TFolder, type TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
import { SugarRushOperationView } from "../views/viewOperation";
import type SugarRushPlugin from "../main";
import { sep } from "path";

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
 * @method generateAbstractPrefix - Generates an abstract prefix for the given file.
 * @method parseAbstractPrefixForId - Parses the abstract prefix for the id of the file.
 * @method isSugarFile - Returns true if the given file is a sugar file.
 **/
export default class SugarRushFileSystemHandler {
	private readonly plugin: SugarRushPlugin;
	abstractMap: Map<number, TAbstractFile> = new Map();

	/** 
	 * Creates a new File System Handler.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/** 
	 * Opens a modal for the operation view with all operations.
	 **/
	openSugarOperationViewModal(): void {
		new SugarRushOperationView(
			this.plugin.app,
			this.plugin.operationHandler.operations
		).open();
	}

	/** 
	 * Returns all sugar files in the vault. (All .sugar files)
	 **/
	getAllSugarFiles() {
		const sugarFiles: TFile[] = [];
		this.plugin.app.vault.getFiles().forEach((file) => {
			if (file.extension === "sugar") {
				sugarFiles.push(file);
			}
		});
		return sugarFiles;
	}

	/** 
	 * Deletes all sugar files in the vault. (All .sugar files)
	 **/
	deleteAllSugarFiles() {
		this.getAllSugarFiles().forEach((file) => {
			this.plugin.app.vault.delete(file).then((r) => {
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
					return this.generateAbstractPrefix(file) + file.name + "/";
				}
				return this.generateAbstractPrefix(file) + file.name;
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
	 * Generates an abstract prefix for the given file.
	 **/
	generateAbstractPrefix(file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		this.abstractMap.set(parseInt(code), file);
		return "<a href=" + code + ">" + "</a>";
	}

	/** 
	 * Parses the abstract prefix for the id of the file.
	 **/
	parseAbstractPrefixForId(line: string): number {
		const code = line.match(/(?<=href=)\w+/);
		const id = parseInt(code?.toString() ?? "");
		return id;
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
