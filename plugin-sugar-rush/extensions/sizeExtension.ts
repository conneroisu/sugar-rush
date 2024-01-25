import type { Extension } from "@codemirror/state";
import { GutterMarker } from "@codemirror/view";
import { gutter } from "@codemirror/view";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import {
	getSizeForAbstractFile,
	parseAbstractPrefixForId,
} from "plugin-sugar-rush/utils";

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
				const id = parseAbstractPrefixForId(lineForFile.text);
				const file = this.plugin.fileSystemHandler.abstractMap.get(id);
				if (file === undefined) {
					return null;
				}
				const bytes = getSizeForAbstractFile(file).toString();
				const numbytes_sci = parseInt(bytes).toExponential(2);
				// const exponent = parseInt(numbytes_sci.split("e")[1]);

				return new SizeMarker(numbytes_sci);
			},
		});
	}
}

/**
 * The `SizeMarker` class is an extension of the `GutterMarker` class that shows the size of the line in the sugra file view.
 **/
export class SizeMarker extends GutterMarker {
	sizeString: string;

	/**
	 * creates a new size marker
	 **/
	constructor(line: string) {
		super();
		this.sizeString = line;
	}

	/**
	 * Renders the marker to the CodeMirror View.
	 **/
	toDOM(): Text {
		return document.createTextNode(this.sizeString);
	}
}
