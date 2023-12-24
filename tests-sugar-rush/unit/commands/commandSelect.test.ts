
import commandSelectSugarViewEntry from 'plugin-sugar-rush/commands/commandSelect';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(commandSelectSugarViewEntry).toBeDefined();
	});
});

