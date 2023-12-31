import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Command that can refresh the currently viewed sugar file to the contents of the parent folder.
 *
 * @param plugin - a reference to the {SugarRushPlugin}.
 * @param checking - a boolean if the command is being checked if it can be ru.
 * @returns boolean - the value describing if the command can be run.
 **/
export default function commandRefreshSugarView(plugin: SugarRushPlugin, checking: boolean) {
	const activeFile = plugin.app.workspace.getActiveFile();
	const leaf = plugin.app.workspace.getMostRecentLeaf();
	if (!checking && activeFile && leaf) {
		// delete all of the sugar files in the vault and then reload the current file

		// reload the current file
		plugin.app.vault
			.modify(activeFile, plugin.fileSystemHandler.generateSugarFileContent(activeFile))
			.then(() => {
				if (plugin.settings.debug) {
					console.log("Refreshed file", activeFile);
				}
				plugin.fileSystemHandler.loadFile(activeFile, leaf);
			});
	} else {
		if (activeFile && leaf) {
			return true;
		}
	}
	return true;
}

