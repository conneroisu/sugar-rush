import { type Extension } from "@codemirror/state";
import { EditorView, ViewUpdate, gutter, lineNumbers, GutterMarker } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
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

class Marker extends GutterMarker {
	/** The text to render in gutter */
	extension: string;

	constructor(text: string) {
		super();
		this.extension = text;
	}

	toDOM() {
		const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		icon.setAttrs({
			width: "1em",
			height: "1em",
			viewBox: "0 0 1em 1em",
			xmlns: "http://www.w3.org/2000/svg",
			align: "center"
		})
		let innerHtml = getIconForFileExtension(this.extension);
		if (innerHtml == "") {
			innerHtml = getIconForFileExtension("");
		}
		icon.innerHTML = innerHtml;
		return icon;
	}
}

const relativeLineIconGutter = gutter({
	lineMarker: (view, line) => {
		const ext = view.state.doc.line(view.state.doc.lineAt(line.from).number).text.match(/(?<=\.)\w+$/);
		if (ext !== null) {
			return new Marker(ext[0]);
		}
		return null;
	}
});

// This ensures the numbers update
// when selection (cursorActivity) happens
const lineNumbersUpdateListener = EditorView.updateListener.of(
	(viewUpdate: ViewUpdate) => {
		if (viewUpdate.docChanged) {
			console.log("lineNumbersUpdateListener");
		}
	}
);

export function iconGutter(): Extension {
	return [lineNumbersUpdateListener, relativeLineIconGutter];
}

