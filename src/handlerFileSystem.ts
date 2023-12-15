import { TFolder, type TAbstractFile, TFile, type Vault, WorkspaceLeaf } from "obsidian";
import type SugarRushPlugin from "./main";
import { sep } from "path";
import iconGutter from "./handlerIcons";

export default class SugarRushFileSystemHandler {
	private vault: Vault;
	private plugin: SugarRushPlugin;
	abstractMap!: Map<number, TAbstractFile>;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
		this.abstractMap = new Map();
	}

	/**
	 *  gets a sugar file's path, the name of the activeFile's parent's folder path
	 *  #param TFile activeFile	the file that is currently active
	 *  #return string the path of the sugar file
	 **/
	getSugarFilePath(activeFile: TFile): string {
		if (activeFile.parent === null) {
			return (
				this.plugin.settings.sugarFolder +
				sep +
				"root" +
				".sugar"
			);
		}
		return (
			this.plugin.settings.sugarFolder +
			sep +
			activeFile.parent.path.replace(sep, "-") +
			".sugar"
		);
	}

	/**
	*	Create a Sugar File: creates a sugar file for the active file
	*	@param TFile activeFile	the file that is currently active
	*	@return Promise<TFile> a promise the newly created sugar file
	**/
	async createSugarFile(activeFile: TFile): Promise<TFile> {
		this.ensureSugarFolder();
		if (this.isSugarFile(activeFile)) {
			console.log("is sugar file");
			console.log(activeFile);
			console.log(this.getSugarFilePath(activeFile));
			if(activeFile.parent === null) {
				throw new Error("Cannot create a sugar file from a sugar file for the root folder");
			}
			console.log("parent of active note: " + activeFile.parent);
			console.log("parent of active note: " + activeFile.parent.path);
			if(activeFile.parent.path === this.plugin.settings.sugarFolder) {
				throw new Error("Cannot create a sugar file from a sugar file for the sugar folder Yet: WIP");
			}
		}
		return await this.vault.create(
			this.getSugarFilePath(activeFile),
			this.generateSugarFileContent(activeFile)
		);
		
	}


	/**
	* 	Generate Sugar File Content: generates the content of a sugar File
	* 	@param TFile activeFile	the file that is currently active
	* 	@return string the content of the sugar file
	**/
	private generateSugarFileContent(activeFile: TFile): string {
		return this.GetParentChildren(activeFile).map((file) => {
			if (file instanceof TFolder) {
				return this.generate_prefix(file) + file.name + "/";
			}
			return this.generate_prefix(file) + file.name;
		}).join("\n")
	}

	/**
	 * Ensure Sugar Folder: ensures that the sugar folder exists
	 * @return void
	 **/
	private ensureSugarFolder() {
		if (!this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder)) {
			this.vault.createFolder(this.plugin.settings.sugarFolder);
		}
	}

	/**
	 * 	Delete Sugar Folder: deletes the sugar folder
	 * 	@return void
	 **/
	deleteSugarFolder() {
		const folder = this.vault.getAbstractFileByPath(this.plugin.settings.sugarFolder);
		if (folder) {
			this.vault.delete(folder, true);
		}
	}

	/**
	 * 	Get Parent Children: gets the children of the parent of the active File
	 * 	@param TFile file	the file that is currently active
	 * 	@return TAbstractFile[] the children of the parent of the active file
	 **/
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

	/**
	 * 	Load Sugar File: loads a sugar file
	 * 	@param TFile file	the file that is currently active
	 * 	@param WorkspaceLeaf leaf	the leaf that is currently active
	 * 	@return void
	 **/
	loadSugarFile(file: TFile, leaf: WorkspaceLeaf) {
		
		leaf.openFile(file);
		this.plugin.extension = iconGutter();
	}

	/**
	 * 	Generate Prefix: generates a prefix for a file
	 *	@param TFile file	the file that is currently active
	 *	@return string the prefix of the file
	 **/
	generate_prefix(file: TAbstractFile): string {
		const code = Math.random().toString(5).substring(2, 7);
		this.abstractMap.set(parseInt(code), file);
		console.log("Abstract Map:");
		console.log(this.abstractMap);
		if (file instanceof TFile) {
			return (
				"<a href=" +
				code +
				">" +
				"</a>"
			);
		}
		return (
			"<a href=" +
			code +
			">" +
			"</a>"
		);
	}

	/**
	* 	Is Sugar File: checks if the active file is a sugar file
	* 	@param TFile activeFile	the file that is currently active
	* 	@return boolean true if the active file is a sugar file, false otherwise
	**/
	isSugarFile(activeFile: TFile): boolean {
		if (activeFile.parent?.path === this.plugin.settings.sugarFolder) {
			return true;
		}
		return false;
	}
}
