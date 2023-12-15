import * as fs from "fs";
import { expect, test } from 'vitest'

// ensure each of the commands in the `./../src/commands/` directory are found in handlerCommands in the form of imports
test("Commands", () => {
	// parse the handlerCommands file 
	const handlerCommands = fs.readFileSync("./src/handlerCommands.ts", "utf-8");
	const handlerCommandsLines = handlerCommands.split("\n");
	// read the files found in the `./../src/commands/` directory
	const commands = fs.readdirSync("./src/commands");
	// commands.forEach((command) => {
	//     expect(handlerCommandsLines).toContain(command.replace(".ts", ""));
	// });
	handlerCommandsLines.forEach((line) => {
		commands.forEach((command) => {
			if (line.includes(command.replace(".ts", ""))) {
				expect(line).toContain(command.replace(".ts", ""));
			}
		});
	});
			
	
});
