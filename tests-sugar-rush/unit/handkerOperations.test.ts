

import SugarRushOperationHandler from 'plugin-sugar-rush/handlerOperations';
import { describe, it, expect } from 'vitest';
import asset from '../../plugin-sugar-rush/!icons.json';

describe("SugarRushPlugin", () => {
  it("should be defined", () => {
	expect(SugarRushOperationHandler).toBeDefined();
  });
});


