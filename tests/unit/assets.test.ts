
import { describe, it, expect } from 'vitest';
import asset from './../../src/assets/!index.json';

// Test the assets structure

describe('Assets', () => {
  it('should have a valid structure', () => {
	expect(asset).toMatchSnapshot();
  });
});


// Test the assets has field: "extension-associations"


