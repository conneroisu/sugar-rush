import { gutter } from "@codemirror/view";
import assets from "../!icons.json";
import { FormatMarker } from "./formatMarker";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type { Extension } from "@codemirror/state";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Returns the icon that corresponds to the given file extension from the assets file.
 * If no icon is associated with this extension, it will return the default icon instead.
 * @param {string} extension - The string referencing the file extension for which an icon is to be retrieved.
 * @return {string} - It returns the icon data string corresponding to the provided file extension.
 */
export function getIconForLineFileExtension(extension: string): string {
	const icon = assets["extension-associations"].find((association) => {
		return association.extensions.includes(extension);
	});
	if (icon === undefined) {
		const defaultIcon = assets["extension-associations"].find(
			(association) => {
				return association.extensions.includes("*");
			}
		);
		if (defaultIcon === undefined) {
			return "";
		}
		return defaultIcon.data;
	}
	return icon.data;
}

export default class FormatExtension implements AbstractExtension {
	plugin: SugarRushPlugin;
	extension: Extension;
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
		this.extension = gutter({
			lineMarker: (view, line) => {
				const lineFileExtension = view.state.doc
					.line(view.state.doc.lineAt(line.from).number)
					.text.match(/(?<=\.)\w+$/);
				if (lineFileExtension !== null) {
					return new FormatMarker(lineFileExtension[0]);
				}
				if (
					view.state.doc.lineAt(line.from).text.trim().endsWith("/")
				) {
					return new FormatMarker("/");
				}
				return null;
			},
		});
	}
	getExtension(): Extension {
		return this.extension;
	}
}