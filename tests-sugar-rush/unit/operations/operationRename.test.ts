import { RenameOperation } from 'plugin-sugar-rush/operations/operationRename';
import { expect, test } from 'vitest'
import { describe, it } from 'vitest';


describe('MoveOperation Exists', () => {
	it('MoveOperation Exists', () => {
		expect(RenameOperation).toBeDefined();
	});
});

