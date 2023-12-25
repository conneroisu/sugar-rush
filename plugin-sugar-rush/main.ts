import { App, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings";
import { SugarRushSettingView } from "./views/viewSettings";
import SugarRushCommandHandler from "./handlers/handlerCommands";
import SugarRushFileSystemHandler from "./handlers/handlerFileSystem";
import SugarRushOperationHandler from "./handlers/handlerOperations";
import SugarRushExtensionHandler from "./handlers/handlerExtensions";

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	operationHandler!: SugarRushOperationHandler;
	extensionHandler!: SugarRushExtensionHandler;
	app!: App;

	async onload() {
		await this.loadSettings();
		this.fileSystemHandler.deleteAllSugarFiles();

		this.registerExtensions(["sugar"], "markdown");
		this.addSettingTab(new SugarRushSettingView(this));
		this.commandHandler = new SugarRushCommandHandler(this);
		this.fileSystemHandler = new SugarRushFileSystemHandler(this);
		this.operationHandler = new SugarRushOperationHandler(this);
		this.extensionHandler = new SugarRushExtensionHandler(this);
		this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && !this.fileSystemHandler.isSugarFile(file)) {
				this.extensionHandler.getExtensions();
				this.app.workspace.updateOptions();
			} else {
				if (this.operationHandler.operations.length > 0) {
					this.fileSystemHandler.openSugarOperationViewModal();
				}
			}
		});
	}

	onunload() { this.fileSystemHandler.deleteAllSugarFiles(); }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
