
import { gutter, GutterMarker } from "@codemirror/view";

class ModifiedGutterMarker extends GutterMarker {
	constructor() {
		super();
	}

	toDOM() {
		let element = document.createElement("div");
		element.classList.add("sugar-rush-gutter-modified");
		return element;
	}
}

export const modifiedGutter = gutter({

})
