import { type Extension } from "@codemirror/state";
import { gutter, GutterMarker } from "@codemirror/view";
import assets from "./assets/!index.json";

function getIconForFileExtension(extension: string): string {
	const icon = assets["extension-associations"].find((association) => {
		return association.extensions.includes(extension);
	});
	if (icon) {
		return icon.data;
	}
	return "";
}

/**
 * Represents a marker used in the gutter.
 */
class Marker extends GutterMarker {
	extension: string;

	/**
	 * Creates a new Marker instance.
	 * @param text - The extension of the marker.
	 */
	constructor(text: string) {
		super();
		this.extension = text;
	}

	/**
	 * Converts the marker to a DOM element.
	 * @returns The DOM element representing the marker.
	 */
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
		let innerHtml = getIconForFileExtension(this.extension);
		if (innerHtml == "") {
			innerHtml = getIconForFileExtension(innerHtml);
		}
		icon.innerHTML = innerHtml;
		return icon;
	}
}

const relativeLineIconGutter = gutter({
	lineMarker: (view, line) => {
		const ext = view.state.doc
			.line(view.state.doc.lineAt(line.from).number)
			.text.match(/(?<=\.)\w+$/);
		if (ext !== null) {
			return new Marker(ext[0]);
		}
		return null;
	},
});

export default function iconGutter(): Extension {
	return [relativeLineIconGutter];
}
