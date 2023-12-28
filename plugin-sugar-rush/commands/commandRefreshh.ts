import type SugarRushPlugin from "plugin-sugar-rush/main";

export default function commandRefreshSugarView(plugin: SugarRushPlugin, checking: boolean) {
	const activeFile = plugin.app.workspace.getActiveFile();
	const leaf = plugin.app.workspace.getMostRecentLeaf();
	if (!checking && activeFile && leaf) {

		// delete all of the sugar files in the vault and then reload the current file
		
		// delete all of the sugar files in the vault
		// this.plugin.fileSystemHandler.deleteAllSugarFiles();

		// reload the current file
		plugin.fileSystemHandler.refreshSugarFile(activeFile, leaf);
	} else {
		if (activeFile && leaf) {
			return true;
		}
	}
	return true;
}
