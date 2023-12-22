

import SugarRushCommandHandler from 'plugin-sugar-rush/handlerCommands';
import { describe, it, expect } from 'vitest';
import asset from '../../plugin-sugar-rush/!icons.json';

describe("SugarRushPlugin", () => {
  it("should be defined", () => {
	expect(SugarRushCommandHandler).toBeDefined();
  });
});


