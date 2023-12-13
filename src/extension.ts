import { type Extension } from "@codemirror/state";
import { EditorView, ViewUpdate, gutter, lineNumbers, GutterMarker } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";

let relativeIconGutter = new Compartment();

class Marker extends GutterMarker {
	/** The text to render in gutter */
	text: string;

	constructor(text: string) {
		super();
		this.text = text;
	}

	toDOM() {
		return document.createDiv(this.text + "a");
	}
}

function relativeLineIcon(lineNo: number, state: EditorState) {
	const charLength = 1;
	const blank = " ".padStart(charLength, " ");

	if (lineNo > state.doc.lines) { return blank; }

	const extension = state.doc.line(lineNo).text.match(/(?<=\.)\w+$/);
	
	if (extension === null) {
		return blank;
	}

	return (extension).toString().padStart(charLength, " ");
}

// This shows the numbers in the gutter
const showLineNumbers = relativeIconGutter.of(
	lineNumbers({ formatNumber: relativeLineIcon })
);

// This ensures the numbers update
// when selection (cursorActivity) happens
const lineNumbersUpdateListener = EditorView.updateListener.of(
	(viewUpdate: ViewUpdate) => {
		if (viewUpdate.docChanged) {
			console.log("lineNumbersUpdateListener");
			viewUpdate.view.dispatch({
				effects: relativeIconGutter.reconfigure(
					lineNumbers({ formatNumber: relativeLineIcon })
				),
			});
		}
	}
);

export function iconGutter(): Extension {
	return [showLineNumbers, lineNumbersUpdateListener];
}
