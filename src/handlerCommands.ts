import { open_sugar_file } from "./utils/OpenSugarFile";
import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.addCommands();
	}

	
	async addCommands() {
		this.plugin.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush To Sugar View",
			callback: () => {
				open_sugar_file(this.plugin);
			},
		});

		this.plugin.addCommand({
			id: "toggle-hidden-files-in-sugar",
			name: "Toggle Hidden Files In Sugar Views",
			callback: () => {
				this.plugin.settings.showHiddenFiles = !this.plugin.settings.showHiddenFiles;
			},
		});
			
	}
}
