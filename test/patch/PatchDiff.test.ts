import diff, { Diff } from "fast-diff";
import { describe, test, expect } from "vitest";
import { Patch } from "../../src/patch/Patch";

describe("path-diff", () => {
  test("basic conversion", () => {
    const prev = "A Beautiful Mind";
    const next = "Beauty and the Beast";
    /*
      fast-diff.Diff      PatchDiff
      ==============      =========
      [ -1, 'A ' ],       -2    
      [  0, 'Beaut'],      5
      [ -1, 'iful'],      -4
      [  1, 'y'],         'y'
      [  0, ' '],          1
      [ -1, 'Mi'],        -2
      [  1, 'a'],         'a'
      [  0, 'nd'],         2
      [  1, ' the Beast'] ' the Beast'
    */
    const diffs: Diff[] = diff(prev, next);
    // 1. fast-diff.Diff[] => PatchDiff[]
    const patch = Patch.fromFastDiff(diffs);
    expect(patch.diffs).toEqual([
      -2,
      "Beaut".length,
      -1 * "iful".length,
      "y",
      " ".length,
      -1 * "Mi".length,
      "a",
      "nd".length,
      " the Beast",
    ]);
    // 2. PatchDiff[] => fast-diff.Diff[]
    expect(patch.toFastDiffs(prev)).toEqual(diffs);
  });

  test("reverse run", () => {
    const diffs: Diff[] = diff("one", "two");
    const patch = Patch.fromFastDiff(diffs);
    expect(patch.run("one", false)).toEqual("two");
    expect(patch.run("two", true)).toEqual("one");
  });
});
