// Check to make sure that all commands are added to SugarRush's commandHandler.
// import commandHandler from "../src/handlerCommands.ts";

// TODO: Implement this.
import { expect, test } from 'vitest'
import { sum } from './sum'
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

