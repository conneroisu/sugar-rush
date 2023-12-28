import { gutter } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import AbstractExtension from "plugin-sugar-rush/contracts/AbstractExtension";
import ConflictMarker from "plugin-sugar-rush/markers/conflictMarker";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * The `conflictExtension` class is an extension of the `AbstractExtension` class from the plugin-sugar-rush package.
 * @implements {AbstractExtension}
 * @property {SugarRushPlugin} plugin - This stores the instance of the SugarRushPlugin class.
 * @method parse_id - This method parses the id of the exception from the line of code.
 **/
export default class ConflictExtension implements AbstractExtension {
	plugin: SugarRushPlugin;

	/**
	 * Creates a new instance of the `ConflictExtension` class.
	 * @param plugin - The instance of the SugarRushPlugin class.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				const fileLine = view.state.doc.line(
					view.state.doc.lineAt(line.from).number
				);
				// search the file ssytem's abstractMap for the code of the line
				const result = this.plugin.fileSystemHandler.abstractMap.get(
					parseInt(this.parse_id(fileLine.text))
				);

				return new ConflictMarker("Exception");
			},
		});
	}

	/**
	 * Parses the id of the exception from the line of code.
	 * @param line - The line of code.
	 * @returns The id of the exception.
	 * @example
	 * // returns "1"
	 * parse_id("1 <a href="1">")
	 * @example
	 * // returns "2"
	 * parse_id("2 <a href="2">")
	 **/
	parse_id(line: string): string {
		return line.split("<a href=")[1].split(">")[0];
	}
}
