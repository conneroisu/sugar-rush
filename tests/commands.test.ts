// Check to make sure that all commands are added to SugarRush's commandHandler.
// import commandHandler from "../src/handlerCommands.ts";

import { App, type PluginManifest } from 'obsidian';
import { expect, test } from 'vitest'
import { sum } from './sum'
import SugarRushCommandHandler from 'src/handlerCommands'
import SugarRushPlugin from 'src/main'

test('adds 1 + 2 to equal 3', () => {
	expect(sum(1, 2)).toBe(3)
})


test('collects all the commands upon the creation of the SugarRushCommandHandler ',
	() => {
		const pluginInterface: PluginManifest = new 
		const commandHandler = new SugarRushCommandHandler(new SugarRushPlugin(new App, pluginInterface));

});

