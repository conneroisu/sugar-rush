
import commandSaveSugarView from 'plugin-sugar-rush/commands/commandSave';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(commandSaveSugarView).toBeDefined();
	});
});

