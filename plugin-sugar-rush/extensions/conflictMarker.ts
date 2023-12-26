import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";
import { FormatMarker } from "./formatMarker";


/**
 * ExceptionMarker is a class that extends the GutterMarker class. 
 * It's used to indicate certain types of exceptions in the code.
 *
 * @property {string} message - This stores the text message of the exception to be displayed.
 *
 * @constructor
 * @param {string} text - The string value to be passed as the exception message.
 *
 * @method toDOM
 * Returns a Node object containing the text of the exception message.
 * This method can be used to display the exception message in the DOM.
 */
export default class ExceptionMarker extends GutterMarker {
	message: string;

	/** 
	 * Creates a new Exception marker that holds a text node
	 **/
	constructor(text: string) {
		super();
		this.message = text;
	}

	toDOM() {
		return document.createTextNode(this.message);
	}
}

