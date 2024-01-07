import type { Extension } from "@codemirror/state";
import { gutter } from "@codemirror/view";
import { getSizeForAbstractFile } from "plugin-sugar-rush/utils";
import type SugarRushPlugin from "plugin-sugar-rush/main";

import { SizeMarker } from "plugin-sugar-rush/markers/markerSize";

/**
 * Size Extension that shows the size of a file in the gutter.
 **/
export default class SizeExtension {
	plugin: SugarRushPlugin;
	extension: Extension;

	/**
	 * Creates a SizeExtension that shows the size of a file in the gutter.
	 * @param plugin - The instance of the plugin.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extension = this.getExtension();
	}

	/**
	 * Returns the extension, Size Extension that shows the size of a {TAbstractFile} in the gutter.
	 **/
	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				const lineForFile = view.state.doc.line(
					view.state.doc.lineAt(line.from).number
				);
				const id =
					this.plugin.fileSystemHandler.parseAbstractPrefixForId(
						lineForFile.text
					);
				const file = this.plugin.fileSystemHandler.abstractMap.get(id);
				if (file === undefined) {
					return null;
				}
				const bytes = getSizeForAbstractFile(file).toString();
				const numbytes_sci = parseInt(bytes).toExponential(2);
				const exponent = parseInt(numbytes_sci.split("e")[1]);

				return new SizeMarker(numbytes_sci);
			},
		});
	}
}
