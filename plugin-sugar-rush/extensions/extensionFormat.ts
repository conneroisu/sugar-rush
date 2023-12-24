import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";

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

export class Marker extends GutterMarker {
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
			return new Marker(lineFileExtension[0]);
		}
		if (view.state.doc.lineAt(line.from).text.trim().endsWith("/")) {
			return new Marker("/");
		}
		return null;
	},
})