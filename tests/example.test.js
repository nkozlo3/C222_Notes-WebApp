/**
 * @jest-environment jsdom
 */
const myFunction = require("./testing-demo.js");

describe("example test suite", () => {
  test("testing example sum function", () => {
    const expectedOutput = 3;
    const actualOutput = myFunction(1, 2);
    expect(actualOutput).toBe(expectedOutput);
  });
});
