// Checks to Ensure all assets are defined in the index.json file and vice versa
import index_json from "../src/assets/!index.json";
import fs from "fs";

import { expect, test } from "vitest";

// Test that each name has a file in src/assets
index_json["extension-associations"].forEach(
	(association: { name: string }) => {
		const { name } = association;
		const filePath = `src/assets/${name}.svg`;
		test(`File ${filePath} exists`, () => {
			console.log(filePath);
			// fs.readFileSync('data.json', 'utf-8')
			expect(fs.existsSync(filePath)).toBe(true);
		});
	}
);

// Test that each file in src/assets has a name in index.json
fs.readdirSync("src/assets").forEach((file: string) => {
	if (file === "!index.json") return;
	const fileName = file.split(".")[0];
	test(`Name ${fileName} is defined in index.json`, () => {
		expect(
			index_json["extension-associations"].some(
				(association: { name: string }) => association.name === fileName
			)
		).toBe(true);
	});
});
