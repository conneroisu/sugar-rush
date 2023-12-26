
import { gutter, GutterMarker } from "@codemirror/view";

/**
 * Modifies the gutter marker to display modified indicator for Abstract files listed in the sugar view.
 * @extends GutterMarker
 * @method toDOM - Creates a DOM element to be used as the marker.
 **/
class ModifiedGutterMarker extends GutterMarker {
	/**
	 * Creates a DOM element to be used as the marker.
	 **/
	constructor() {
		super();
	}

	/**
	 * Creates a DOM element to be used as the marker.
	 **/
	toDOM() {
		let element = document.createElement("div");
		element.classList.add("sugar-rush-gutter-modified");
		return element;
	}
}

/**
 * `modifiedGutter` is an object that uses the `gutter` function from "@codemirror/view" to initialize a new gutter.
 * This gutter object is exported for use elsewhere within the application.
 * Note that the `gutter` function is currently called with an empty configuration object `{}`.
 * The parameters of your gutter can be defined within this object.
 * TODO: implement
 **/

export const modifiedGutter = gutter({

})
