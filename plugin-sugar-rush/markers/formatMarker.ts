import { GutterMarker } from "@codemirror/view";
import { getIconForLineFileExtension } from "../extensions/formatExtension";

/**
 * The FormatMarker class, a subclass of GutterMarker, represents a format indicator in file with associated icons.
 * @public
 * @class
 * @extends GutterMarker
 * @property {string} extension - Denotes the file extension associated with the FormatMarker instance.
 * The constructor takes an input text value which it uses to set the 'extension' property of the instance.
 * It extends the GutterMarker class and inherits all its methods and properties.
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
