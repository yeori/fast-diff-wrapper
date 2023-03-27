import { describe, test, assert } from "vitest";
import diff from "fast-diff";

describe("fast-diff", () => {
  test("ready", () => {
    /**
     * 0: abc  0: a123
     *         1: 456
     * 1: def  2: 78ef
     * 2: ghi  3: gh987
     *         4: 654
     * 3: xi   5: 32i
     */
    const changes = diff(
      "abc\ndef\nghi\nxi",
      "a123\n456\n78ef\ngh987\n654\n32i"
    );
    /*
    [  0, 'a' ]
    [ -1, 'bc' ]
    [  1, '123' ]
    [  0, '\n' ]
    [ -1, 'd' ]
    [  1, '456\n78' ]
    [  0, 'ef\ngh' ]
    [ -1, 'i' ]
    [  1, '987\n654' ]
    [  0, '\n' ]
    [ -1, 'x' ]
    [  1, '32' ]
    [  0, 'i' ]
    */
    changes.forEach((c) => {
      console.log(c);
    });
  });
});
