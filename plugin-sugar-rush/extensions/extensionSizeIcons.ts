import { gutter, GutterMarker } from "@codemirror/view";

/**
 * Show s the abstract files's size in the file explorer.
 **/


export class SizeMarker extends GutterMarker {
	constructor() {
		super();
	}
}

export const sizeGutter = gutter({
	lineMarker: (view, line) => {
		// const size = line.length;
		// return size ? new SizeMarker() : null;
		
	}
});
