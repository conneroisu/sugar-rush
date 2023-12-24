


import SugarRushFileSystemHandler from 'plugin-sugar-rush/handlerFileSystem';
import { describe, it, expect } from 'vitest';
import asset from '../../plugin-sugar-rush/!icons.json';

describe("SugarRushPlugin", () => {
  it("should be defined", () => {
	expect(SugarRushFileSystemHandler).toBeDefined();
  });
});


