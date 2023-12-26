import { gutter } from "@codemirror/view";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { ExceptionMarker } from "./conflictMarker";

export default class ExceptionExtension extends AbstractExtension {

	constructor(plugin: SugarRushPlugin) {
		super(plugin);
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
