
import { gutter } from "@codemirror/view";
import { GutterMarker } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

/**
 * Extension that shows the modified date of a file using text.
 * @property {Extension} extension - The extension that is used to show the modified date of a file.
 **/
export default class DateExtension {
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
					return new DateMarker(lineFileExtension[0]);
				}
				if (view.state.doc.lineAt(line.from).text.trim().endsWith("/")) {
					return new DateMarker("/");
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
export class DateMarker extends GutterMarker {
	body: string;

	/**
	 * Creates a new FormatMarker that holds a text node
	 * @param {string} text - The text to be displayed in the marker.
	 **/
	constructor(text: string) {
		super();
		this.body = text;
	}

	/**
	 * Renders the marker to the dom.
	 **/
	toDOM() {
		const text = document.createElement("div");
		text.innerText = this.body;
		return text;
	}
}
