import type SugarRushPlugin from "./main";

export default class SugarRushIntervalHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	async addIntervals() {
		// Add the interval for checking the current path
		this.plugin.registerInterval(
			window.setInterval(() => {
				// this.checkPath();
			}, 1000)
		);
	}
}
