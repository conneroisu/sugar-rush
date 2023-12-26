import { gutter } from "@codemirror/view";
import assets from "../!icons.json";
import { FormatMarker } from "./formatMarker";
import { AbstractExtension } from "plugin-sugar-rush/handlers/handlerExtensions";
import type { Extension } from "@codemirror/state";
import type SugarRushPlugin from "plugin-sugar-rush/main";

/**
 * Returns the icon that corresponds to the given file extension from the assets file.
 * If no icon is associated with this extension, it will return the default icon instead.
 * If no icon is found including the default one, it will return an empty string.
 *
 * @param {string} extension - The string referencing the file extension for which an icon is to be retrieved.
 *
 * @return {string} - It returns the icon data string corresponding to the provided file extension.
 *
 * Note: The function specifically works on the 'extension-associations' section in the assets file,
 * where it looks at 'extensions' field for file extension and 'data' field for the corresponding icon.
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

export default class FormatExtension extends AbstractExtension {
	constructor(plugin: SugarRushPlugin) {
		super(plugin);
	}
	getExtension(): Extension {
		return gutter({
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
}
