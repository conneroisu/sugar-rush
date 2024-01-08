import { gutter } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { FormatMarker } from "plugin-sugar-rush/markers/markerFormat";

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
				if (
					view.state.doc.lineAt(line.from).text.trim().endsWith("/")
				) {
					return new FormatMarker("/");
				}
				return null;
			},
		});
	}

	/**
	 * Returns the extension
	 **/
	getExtension(): Extension {
		return this.extension;
	}
}
