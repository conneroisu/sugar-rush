
import { describe, it, expect } from 'vitest';
import asset from '../../plugin-sugar-rush/!icons.json';
import { assert } from 'console';

// Test the assets structure

describe('Assets', () => {
  it('should have a valid structure', () => {
		assert(asset);
		assert(asset["extension-associations"]);
		assert(JSON.stringify(asset["extension-associations"]).length);
  });
});


