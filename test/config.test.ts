import { describe, test, assert } from "vitest";
import diff from "../src";
describe("test", () => {
  test("ready", () => {
    const changes = diff.createMarks("a", "b");
    assert.equal(changes.length, 2);
  });
});
