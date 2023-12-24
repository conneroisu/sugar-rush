import { gutter, GutterMarker } from "@codemirror/view";

export class ExceptionMarker extends GutterMarker {
	message: string;

	constructor(text: string) {
		super();
		this.message = text;
	}

	toDOM() {
		return document.createTextNode(this.message);
	}
}

export const relativeOperationExceptionGutter = gutter({
	lineMarker: (view, line) => {
		const fileLine = view.state.doc.line(view.state.doc.lineAt(line.from).number)
		return new ExceptionMarker("f");
	}
})
