import { GutterMarker } from "@codemirror/view";

/**
 * The `SizeMarker` class is an extension of the `GutterMarker` class that shows the size of the line in the sugra file view.
 **/
export class SizeMarker extends GutterMarker {
	message: string;

	/**
	 * Createsanew size marker
	 **/
	constructor(line: string) {
		super();
		this.message = line;
	}

	/**
	* Renders the marker to the dom.
	**/
	toDOM(): Text {
		return document.createTextNode(this.message);
	}
}
