import type SugarRushPlugin from "./main";
import assets from "./assets/!index.json"
import fs from "fs";


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
			// read the name of the icon from the association and find the file in the assets folder for the svg
			const name = icon.name;
			const iconPath = "./assets/" + name + ".svg";
			// read the file and return it's contents
			fs.readFile(iconPath, (err, data) => {
				if (err) {
					console.error(err);
					return;
				}
				return data;
			});
		} 
		return "";
	}
}
