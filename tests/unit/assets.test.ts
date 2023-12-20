
import { describe, it, expect } from 'vitest';
import asset from './../../src/assets/!index.json';
import { assert } from 'console';

// Test the assets structure

describe('Assets', () => {
  it('should have a valid structure', () => {
		assert(asset);
  });
});


// Test the assets has field: "extension-associations"


