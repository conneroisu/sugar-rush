import { gutter, GutterMarker } from "@codemirror/view";
import assets from "../!icons.json";
import type SugarRushPlugin from "plugin-sugar-rush/main";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type { Extension } from "@codemirror/state";

export default class IndicatorsExtension extends AbstractExtension {
	constructor(plugin: SugarRushPlugin) {
		super(plugin);
	}

	getExtension(): Extension {
		throw new Error("Method not implemented.");
	}

	modifiedGutter = gutter({});
}
