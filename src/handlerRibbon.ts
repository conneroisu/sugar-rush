import { Notice } from "obsidian";
import SugarRushPlugin from "./main";
import { addIcon } from "obsidian";

/**
 * Represents a handler for the Sugar Rush ribbon.
 */
export default class SugarRushRibbonHandler {
	plugin: SugarRushPlugin;

	/**
	 * Creates an instance of SugarRushRibbonHandler.
	 * @param plugin - The SugarRushPlugin instance.
	 */
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		if (this.plugin.settings.showRibbonIcon) {
			addIcon("sugar-rush", `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M511.492,288.022c-1.055-4.082-3.69-7.576-7.322-9.715l-144.826-85.284V17.37c0-8.778-7.117-15.895-15.895-15.895H108.304 c-8.778,0-15.895,7.117-15.895,15.895v219.748H15.895C7.117,237.118,0,244.235,0,253.013v235.145 c0,8.778,7.117,15.895,15.895,15.895H251.04c8.778,0,15.895-7.117,15.895-15.895v-39.771l101.784,59.938 c2.533,1.491,5.31,2.2,8.051,2.2c5.445,0,10.748-2.801,13.711-7.832l119.321-202.624 C511.941,296.437,512.549,292.103,511.492,288.022z M235.145,472.264H31.79V268.908h203.355V472.264z M237.382,236.619H124.199 V33.265h203.355v141.038l-26.009-15.316c-3.634-2.139-7.967-2.748-12.047-1.691c-4.082,1.055-7.576,3.69-9.715,7.322 L237.382,236.619z M371.153,472.867l-104.219-61.372V253.013h0.001c0-1.141-0.126-2.253-0.355-3.326l32.529-55.24l175.232,103.189 L371.153,472.867z"></path> </g> </g> </g></svg>`);
			this.addRibbonIcon();
		}
	}

	/**
	 * Adds the Sugar Rush ribbon icon for rushing to a sugar view.
	 **/
	addRibbonIcon() {
		this.plugin.addRibbonIcon(
			"sugar-rush",
			"Sugar Rush : Rush To Sugar View",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
	}
}
