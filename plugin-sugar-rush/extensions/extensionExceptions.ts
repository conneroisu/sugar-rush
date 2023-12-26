import { gutter, GutterMarker } from "@codemirror/view";
import type SugarRushPlugin from "plugin-sugar-rush/main";


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

export class ExceptionMarker extends GutterMarker {
	message: string;

	constructor(text: string) {
		super();
		this.message = text;
	}

	toDOM() {
		return document.createTextNode(this.message);
	}
}

class ExceptionExtension {
	plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}
	relativeOperationExceptionGutter = gutter({
		lineMarker: (view, line) => {
			const fileLine = view.state.doc.line(view.state.doc.lineAt(line.from).number);
			// search the file ssytem's abstractMap for the code of the line
			const result = this.plugin.fileSystemHandler.abstractMap.get(parseInt(this.parse_id(fileLine.text)))

			return new ExceptionMarker("Exception");
		}
	})


	parse_id(line: string): string {
		return line.split("<a href=")[1].split(">")[0];
	}
}
