

import commandRefreshSugarView from 'plugin-sugar-rush/commands/commandRefresh';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(commandRefreshSugarView).toBeDefined();
	});
});

