import { gutter } from "@codemirror/view";
import { GutterMarker } from "@codemirror/view";
import { getIconForLineFileExtension } from "plugin-sugar-rush/utils";
import type { Extension } from "@codemirror/state";

/**
 * Extension that shows the format of a file
 **/
export default class FormatExtension {
	extension: Extension;

	/**
	 * Creates a new FormatExtension that shows the format of a file
	 **/
	constructor() {
		this.extension = gutter({
			lineMarker: (view, line) => {
				const lineFileExtension = view.state.doc
					.line(view.state.doc.lineAt(line.from).number)
					.text.match(/(?<=\.)\w+$/);
				if (lineFileExtension !== null) {
					return new FormatMarker(lineFileExtension[0]);
				}
				if (view.state.doc.lineAt(line.from).text.trim().endsWith("/")) {
					return new FormatMarker("/");
				}
				return null;
			}
		});
	}


	/**
	 * Returns the extension
	 **/
	getExtension(): Extension {
		return this.extension;
	}
}

/**
 * The format indicator in file with associated icons for each file extension.
 * @property {string} extension - Denotes the file extension associated with the FormatMarker instance.
 * @method toDOM - Overrides the toDOM method of the GutterMarker class.
 * @returns {HTMLElement} - Returns an SVG element with attached attributes and inner HTML derived from the
 * current extension via the getIconForLineFileExtension() function.
 **/
export class FormatMarker extends GutterMarker {
	extension: string;

	/**
	 * Creates a new FormatMarker that holds a text node
	 * @param {string} text - The text to be displayed in the marker.
	 **/
	constructor(text: string) {
		super();
		this.extension = text;
	}

	/**
	 * Renders the marker to the dom.
	 **/
	toDOM() {
		const icon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg"
		);
		icon.setAttrs({
			width: "1em",
			height: "1em",
			viewBox: "0 0 1em 1em",
			xmlns: "http://www.w3.org/2000/svg",
			align: "center",
		});
		icon.innerHTML = getIconForLineFileExtension(this.extension);
		return icon;
	}
}
