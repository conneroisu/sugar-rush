import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";

/**
 * Indicates changes in the 
 **/
class IndicatorsGutterMarker extends GutterMarker {
	icon!: string;

	/** 
	 * Creates a new IndicatorsGutterMarker 
	 **/
	constructor(line: string) {
		super();
	}

	/** 
	 * Renders the marker to the dom.
	 **/
	toDOM(): Text {
		return document.createTextNode(this.lineString);
	}
}
