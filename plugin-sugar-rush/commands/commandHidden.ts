import { Notice } from "obsidian";
import type SugarRushPlugin from "plugin-sugar-rush/main";

export default function commandToggleHiddenFiles(plugin: SugarRushPlugin, checking: boolean) {
		if( plugin.operationHandler.operations.length > 0 )  {
			new Notice("Cannot toggle hidden files while an operation is in progress.");
		}
		plugin.settings.showHiddenFiles = !plugin.settings.showHiddenFiles;
		plugin.saveSettings();
}
