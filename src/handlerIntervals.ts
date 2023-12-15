import type SugarRushPlugin from "./main";

export default class SugarRushIntervalHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	async addIntervals() {
		this.plugin.registerInterval(
			window.setInterval(() => {
				if (this.plugin.settings.hideSugarFolder) {
					changePathVisibility(this.plugin.settings.sugarFolder,true);
				}
			}, 1000)
		);
	}
}
