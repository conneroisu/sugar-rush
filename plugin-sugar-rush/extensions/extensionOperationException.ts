import { gutter, GutterMarker } from "@codemirror/view";

export class ExceptionMarker extends GutterMarker {
	message: string;

	constructor(text: string) {
		super();
		this.message = text;
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
		return icon;
	}
}

export const relativeOperationExceptionGutter = gutter({
	lineMarker: (view, line) => {
		const fileLine = view.state.doc.line(view.state.doc.lineAt(line.from).number)
		return new ExceptionMarker("f");
	}
})
