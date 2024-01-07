import { GutterMarker } from "@codemirror/view";

/**
 * The `SizeMarker` class is an extension of the `GutterMarker` class that shows the size of the line in the sugra file view.
 **/
export class SizeMarker extends GutterMarker {
	sizeString: string;

	/**
	 * creates a new size marker
	 **/
	constructor(line: string) {
		super();
		this.sizeString = line;
	}

	/**
	 * Renders the marker to the dom.
	 **/
	toDOM(): Text {
		return document.createTextNode(this.sizeString);
	}
}
