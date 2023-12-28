import type SugarRushPlugin from "plugin-sugar-rush/main";

export default function commandSaveSugarView(plugin: SugarRushPlugin, checking: boolean) {
	if (checking) {
		return plugin.operationHandler.operations.length > 0;
	}
	if (!checking) {
		plugin.fileSystemHandler.openSugarOperationViewModal();
	}
}
