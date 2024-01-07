import type { Extension } from "@codemirror/state";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { gutter } from "@codemirror/view";
import { CreateOperation } from "plugin-sugar-rush/operations/operationCreate";
import { DeleteOperation } from "plugin-sugar-rush/operations/operationDelete";
import { MoveOperation } from "plugin-sugar-rush/operations/operationMove";
import { RenameOperation } from "plugin-sugar-rush/operations/operationRename";
import { parse_id } from "plugin-sugar-rush/utils";
import ConflictMarker from "plugin-sugar-rush/markers/markerConflict";

/**
 * Extension that shows conflicts in the gutter.
 * @property {SugarRushPlugin} plugin - This stores reference instance of the SugarRushPlugin class.
 * @method parse_id - This method parses the id of the exception from the line of code.
 **/
export default class ConflictExtension {
	plugin: SugarRushPlugin;

	/**
	 * Creates a new instance of the `ConflictExtension` class.
	 * @param plugin - The instance of the SugarRushPlugin class.
	 **/
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	/** 
	 * Returns the extension for ConflictExtension
	 **/
	getExtension(): Extension {
		return gutter({
			lineMarker: (view, line) => {
				const fileLine = view.state.doc.line(
					view.state.doc.lineAt(line.from).number
				);
				// search the file ssytem's operationsMap for the code of the line
				const result = this.plugin.fileSystemHandler.operationsMap.get(
					parseInt(parse_id(fileLine.text))
				);

				switch (result) {
					case CreateOperation:
						return new ConflictMarker("Create");
					case DeleteOperation:
						return new ConflictMarker("Delete");
					case MoveOperation: 
						return new ConflictMarker("Move");
					case RenameOperation:
						return new ConflictMarker("Rename");
					case undefined:
						return new ConflictMarker("");
				}
			},
		});
	}

}
