import { DEFAULT_SETTINGS } from 'plugin-sugar-rush/settings';
import { describe, it, expect } from 'vitest';

describe("SugarRushPluginSettings", () => {
	it("should be defined", () => {
		expect(DEFAULT_SETTINGS).toBeDefined();
	});
});


