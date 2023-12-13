import type SugarRushPlugin from "./main";
import assets from "./assets/!index.json";

export default class SugarRushIconHandler {
	plugin!: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Gets an icon for the given file extension.
	 **/
	getIconForFileExtension(extension: string): string {
		const icon = assets["extension-associations"].find((association) => {
			return association.extensions.includes(extension);
		});
		if (icon) {
			// get the icons from devicons
			return icon.data;
		}
		return "";
	}
}
