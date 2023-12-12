import { TFile, TFolder } from "obsidian";

function GetParentChildren(file: TAbstractFile): TAbstractFile[] {
    if (file instanceof TFolder) {
        return file.children;
    } else if (file instanceof TFile) {
        if (file.parent === null) {
            return await GetRootChildren();
        } else {
            return file.parent.children;
        }
    }
}

function GetRootChildren(): TAbstractFile[] {
	return this.app.vault.getRoot().children;
}
