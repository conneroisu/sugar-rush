class IndicatorsGutterMarker extends GutterMarker {
	lineString: string;
	icon: string;

	constructor(line: string) {
		super();
		this.lineString = line;
		const tempIcon = assets["extension-associations"].find(
			(association) => {
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
