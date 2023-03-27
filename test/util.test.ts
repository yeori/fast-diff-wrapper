import { describe, test, expect } from "vitest";
import util from "../src/util";
import { Diff } from "fast-diff";
import helper from "./helper";
const DELIM = "\n";
describe("util.normalizeDiffs", () => {
  test("1 para", () => {
    const diff: Diff = [1, "no para here"];
    const diffs = util.normalizeDiff(diff, DELIM);
    expect(diffs.length).to.equal(1);
    expect(diffs[0][1]).to.equal("no para here");
  });
  test("two paras", () => {
    const diff: Diff = [1, "abc\ndef"];
    const diffs = util.normalizeDiff(diff, DELIM);
    helper.assertDiffs(diffs, "abc,\n,def".split(","));
  });
  test("three empty paras", () => {
    const diff: Diff = [1, "\n\n\n"];
    const diffs = util.normalizeDiff(diff, DELIM);
    helper.assertDiffs(diffs, "\n \n \n".split(" "));
  });
  test("one empty para inside tokens", () => {
    const diff: Diff = [1, "one\n\ntwo"];
    const diffs = util.normalizeDiff(diff, DELIM);
    helper.assertDiffs(diffs, "one,\n,\n,two".split(","));
  });
});
