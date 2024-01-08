import { GutterMarker } from "@codemirror/view";

/**
 * ExceptionMarker is a class that extends the GutterMarker class. 
 * @property {string} message - This stores the text message of the exception to be displayed.
 * @method toDOM - This method overrides the toDOM method of the GutterMarker class.
 **/
export default class ConflictMarker extends GutterMarker {
	message: string;

	/** 
	 * Creates a new Exception marker that holds a text node
	 **/
	constructor(text: string) {
		super();
		this.message = text;
	}

	/**
	 * Renders the marker to teh dom.
	 **/
	toDOM() {
		return document.createTextNode(this.message);
	}
}

