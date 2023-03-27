import { describe, test, expect } from "vitest";
import diff from "../src";
describe("index.ts", () => {
  test("normalized diffs", () => {
    const diffs = diff.paraDiff("Ab\nxY", "AB\n123\nXY");
    /*
     A  b \n x Y
     0 -1 0
       +1
    */
    expect(diffs.map((df) => df[1])).toEqual(
      "A,b,B,\n,x,123,\n,X,Y".split(",")
    );
    expect(diffs.map((df) => df[0])).toEqual([0, -1, +1, 0, -1, +1, +1, +1, 0]);
  });
});
