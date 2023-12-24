
import commandToggleHiddenFiles from 'plugin-sugar-rush/commands/commandHidden';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(commandToggleHiddenFiles).toBeDefined();
	});
});

