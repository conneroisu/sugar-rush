import type SugarRushPlugin from "./main";

export default class SugarRushExtensionHandler {
    plugin: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.registerExtensions();
	}
    registerExtensions() {
        throw new Error("Method not implemented.");
    }
}
