import { App, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, type SugarRushPluginSettings } from "./settings";
import { SugarRushSettingTab } from "./views/settingsPage";
import SugarRushCommandHandler from "./handlerCommands";
import SugarRushFileSystemHandler from "./handlerFileSystem";
import SugarRushOperationHandler from "./handlerOperations";
import SugarRushExtensionHandler from "./handlerExtensions";

export default class SugarRushPlugin extends Plugin {
	settings!: SugarRushPluginSettings;
	commandHandler!: SugarRushCommandHandler;
	fileSystemHandler!: SugarRushFileSystemHandler;
	operationHandler!: SugarRushOperationHandler;
	extensionHandler!: SugarRushExtensionHandler;

	app!: App;

	async onload() {
		await this.loadSettings();

		this.registerExtensions(["sugar"], "markdown");
		this.addSettingTab(new SugarRushSettingTab(this));
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
