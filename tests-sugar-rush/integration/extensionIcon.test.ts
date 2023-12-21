
import { expect, test } from 'vitest'
import { getIconForLineFileExtension, Marker } from "src/extensionIcons";

// test for getIconForLineFileExtension method

const DEFAULT_EXTENSION_TO_TEST = ["md", "js", "ts", "py", "html", "css", "json", "xml", "yaml", "yml", "toml", "sh", "bat", "cmd", "ps1", "psm1", "psd1", "ps1xml", "psc1", "pssc", "cdxml", "xaml", "java", "c", "cpp", "cs", "go", "rs", "php", "rb", "swift", "kt", "clj", "cljc", "cljs", "groovy"]
test("getIconForLineFileExtension markdown", () => {
	const icon = getIconForLineFileExtension("md");
	expect(icon).toBeDefined()
	// asssert that it was not null
	expect(icon).not.toBeNull()

	// assert aht the response out is nto null
	DEFAULT_EXTENSION_TO_TEST.forEach((extension) => {
		const icon = getIconForLineFileExtension(extension);
		expect(icon).toBeDefined()
		// asssert that it was not null
		expect(icon).not.toBeNull()
	}
	);
	// TODO: assert that the response is not null and theat the response is not the unknown icon


});


// test for Marker class

const DEFAULT_EXTENSION_TO_TEST_MARKER = ["md", "js", "ts", "py", "html", "css", "json", "xml", "yaml", "yml", "toml", "sh", "bat", "cmd", "ps1", "psm1", "psd1", "ps1xml", "psc1", "pssc", "cdxml", "xaml", "java", "c", "cpp", "cs", "go", "rs", "php", "rb", "swift", "kt", "clj", "cljc", "cljs", "groovy"]

test("Marker class", () => {
	// assert that the response out is nto null
	DEFAULT_EXTENSION_TO_TEST_MARKER.forEach((extension) => {
		const marker = new Marker(extension);
		expect(marker).toBeDefined()
		// asssert that it was not null
		expect(marker).not.toBeNull()
	})
});

