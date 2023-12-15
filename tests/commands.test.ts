// Check to make sure that all commands are added to SugarRush's commandHandler.
// import commandHandler from "../src/handlerCommands.ts";

import { App, type PluginManifest } from "obsidian";
import { expect, test } from "vitest";
import { sum } from "./sum";
import SugarRushCommandHandler from "src/handlerCommands";
import SugarRushPlugin from "src/main";
import manifest from "../manifest.json";
import { fstat } from "fs";

test("adds 1 + 2 to equal 3", () => {
	expect(sum(1, 2)).toBe(3);
});

test("collects all the commands upon the creation of the SugarRushCommandHandler ", () => {
	// get the costant id form the plugin manifest
	const id = manifest.id;

	const pluginInterface: PluginManifest = {
		id: manifest.id,
		name: manifest.name,
		author: manifest.author,
		version: manifest.version,
		minAppVersion: manifest.minAppVersion,
		description: manifest.description,
	}; // Initialize the pluginInterface variable
	const commander = new SugarRushCommandHandler(
		new SugarRushPlugin(new App(), pluginInterface)
	);
	console.log(commander.commands);
	expect(commander.commands).not.toBeNull();

	expect(commander.commands.length).toBeGreaterThan(0);

	// load each of the commands in the commands folder and expect them to be in the commands array
	Object.values(fstat).forEach((command) => {
		expect(commander.commands).toContain(command);
	});
}); // Add a closing curly brace her to close the function
