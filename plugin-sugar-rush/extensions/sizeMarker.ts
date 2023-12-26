import { gutter, GutterMarker } from "@codemirror/view";

/**
 * The `SizeMarker` class is an extension of the `GutterMarker` class from the @codemirror/view package.
 *
 * The class currently doesn't define any instance variables or methods of its own and
 * solely relies on those from the parent class `GutterMarker`.
 *
 * The provided `constructor` method, apart from calling the constructor of its parent class `GutterMarker`,
 * does not perform any additional operations.
 */

export class SizeMarker extends GutterMarker {
	constructor() {
		super();
	}
}
