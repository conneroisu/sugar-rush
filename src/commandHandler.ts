import { open_sugar_file } from "./utils/OpenSugarFile";
import SugarRushPlugin from "./main";

export default class SugarRushCommandHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		onload();
	}

	
	async onload() {
		this.plugin.addCommand({
			id: "rush-to-sugar-view",
			name: "Rush To Sugar View",
			callback: () => {
				open_sugar_file(this);
			},
		});
	}
}
