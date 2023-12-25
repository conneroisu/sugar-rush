import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";

/**
 * Returns the icon that corresponds to the given file extension from the assets file.
 * If no icon is associated with this extension, it will return the default icon instead.
 * If no icon is found including the default one, it will return an empty string.
 *
 * @param {string} extension - The string referencing the file extension for which an icon is to be retrieved.
 *
 * @return {string} - It returns the icon data string corresponding to the provided file extension.
 *
 * Note: The function specifically works on the 'extension-associations' section in the assets file,
 * where it looks at 'extensions' field for file extension and 'data' field for the corresponding icon.
 */

export function getIconForLineFileExtension(extension: string): string {
	const icon = assets["extension-associations"].find((association) => {
		return association.extensions.includes(extension);
	});
	if (icon === undefined) {
		const defaultIcon = assets["extension-associations"].find((association) => {
			return association.extensions.includes("*")
		});
		if (defaultIcon === undefined) {
			return "";
		}
		return defaultIcon.data;
	}
	return icon.data;
}

/**
 * The FormatMarker class, a subclass of GutterMarker, represents a format indicator in file with associated icons.
 * 
 * @public
 * @class
 * @extends GutterMarker
 *
 * @property {string} extension - Denotes the file extension associated with the FormatMarker instance.
 *
 * The constructor takes an input text value which it uses to set the 'extension' property of the instance.
 * It extends the GutterMarker class and inherits all its methods and properties.
 *
 * @constructor
 * @param {string} text - A string that is utilized to set the 'extension' property of an instance.
 *
 * The toDOM() method creates and styles an SVG element, then assigns it an icon that matches the current 'extension'. The SVG
 * is then returned as a DOM element.
 *
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

export const formatGutter = gutter({
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
	},
})
