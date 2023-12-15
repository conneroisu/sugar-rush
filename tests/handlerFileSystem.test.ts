import { TFile, Vault, WorkspaceLeaf } from "obsidian";
import SugarRushFileSystemHandler from "../src/handlerFileSystem";
import SugarRushPlugin from "../src/main";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("SugarRushFileSystemHandler", () => {
	let handler: SugarRushFileSystemHandler;
	let plugin: SugarRushPlugin;
	let activeFile: TFile;
	let vault: Vault;
	let leaf: WorkspaceLeaf;

	beforeEach(() => {
		plugin = new SugarRushPlugin();
		handler = new SugarRushFileSystemHandler(plugin);
		activeFile = new TFile("test.md", "/path/to/test.md");
		vault = new Vault("/path/to/vault");
		leaf = new WorkspaceLeaf(vault, null); // Add null as the second argument
	});

	afterEach(() => {
		// Clean up any created sugar files or folders
		handler.deleteSugarFolder();
	});

	test("should create a sugar file for the active file", async () => {
		const sugarFile = await handler.createSugarFile(activeFile);
		expect(sugarFile).toBeDefined();
		expect(sugarFile.path).toContain("/path/to/vault/.sugar-rush/");
		expect(sugarFile.basename).toContain("test.sugar.md");
	});

	test("should load a sugar file", () => {
		handler.createSugarFile(activeFile);
		handler.loadSugarFile(activeFile, leaf);
		// Add your assertions here
	});

	test("should check if a file is a sugar file", () => {
		const isSugarFile = handler.isSugarFile(activeFile);
		expect(isSugarFile).toBe(false);
		handler.createSugarFile(activeFile);
		const isSugarFileAfterCreation = handler.isSugarFile(activeFile);
		expect(isSugarFileAfterCreation).toBe(true);
	});

	// Add more test cases as needed
});
