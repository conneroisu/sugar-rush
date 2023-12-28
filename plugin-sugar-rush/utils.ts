import assets from "./!icons.json";

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
