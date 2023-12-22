

import SugarRushExtensionHandler from 'plugin-sugar-rush/handlerExtensions';
import { describe, it, expect } from 'vitest';
import asset from '../../plugin-sugar-rush/!icons.json';

describe("SugarRushPlugin", () => {
  it("should be defined", () => {
	expect(SugarRushExtensionHandler).toBeDefined();
  });
});


