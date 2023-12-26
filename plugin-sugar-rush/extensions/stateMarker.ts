import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";

class IndicatorsGutterMarker extends GutterMarker {
	lineString: string;
	icon: string;

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

	toDOM(): Text {
		return document.createTextNode(this.lineString);
	}
}
