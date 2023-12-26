import { gutter, GutterMarker } from "@codemirror/view";
import { getIconForLineFileExtension } from "./conflictMarker";

/**
 *
 * The FormatMarker class, a subclass of GutterMarker, represents a format indicator in file with associated icons.
 * @public
 * @class
 * @extends GutterMarker
 * @property {string} extension - Denotes the file extension associated with the FormatMarker instance.
 * The constructor takes an input text value which it uses to set the 'extension' property of the instance.
 * It extends the GutterMarker class and inherits all its methods and properties.
 * @constructor
 * @param {string} text - A string that is utilized to set the 'extension' property of an instance.
 * The toDOM() method creates and styles an SVG element, then assigns it an icon that matches the current 'extension'. The SVG
 * is then returned as a DOM element.
 * @method
 * @returns {HTMLElement} - Returns an SVG element with attached attributes and inner HTML derived from the
 * current extension via the getIconForLineFileExtension() function.
 */

export class FormatMarker extends GutterMarker {
	extension: string;

	constructor(text: string) {
		super();
		this.extension = text;
	}

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
