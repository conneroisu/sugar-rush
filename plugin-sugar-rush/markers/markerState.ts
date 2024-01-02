import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";

/**
 * Indicates changes in the 
 **/
class IndicatorsGutterMarker extends GutterMarker {
	lineString: string;
	icon!: string;

	/** 
	 * Creates a new IndicatorsGutterMarker 
	 **/
	constructor(line: string) {
		super();
		this.lineString = line;
		const tempIcon = assets["extension-associations"].find(
			(association: { extensions: string | string[] }) => {
				return association.extensions.includes("?");
			}
		);
		if (tempIcon !== undefined) {
			this.icon = tempIcon.data;
		}
	}

	/** 
	 * Renders the marker to the dom.
	 **/
	toDOM(): Text {
		return document.createTextNode(this.lineString);
	}
}