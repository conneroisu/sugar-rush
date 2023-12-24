import commandRushToSugarView from 'plugin-sugar-rush/commands/commandRush';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(commandRushToSugarView).toBeDefined();
	});
});

