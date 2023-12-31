import { GutterMarker } from "@codemirror/view";

/**
 * The `SizeMarker` class is an extension of the `GutterMarker` class from the @codemirror/view package.
 * The class currently doesn't define any instance variables or methods of its own and
 * solely relies on those from the parent class `GutterMarker`.
 * The provided `constructor` method, apart from calling the constructor of its parent class `GutterMarker`,
 * does not perform any additional operations.
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
