import { describe, test, assert } from "vitest";
import diff from "../../src";
import { assertRange } from "../helper";

describe("diff by character", () => {
  test("text appended", () => {
    const [before, after] = ["ready", "ready to go"];
    const [prev, next] = diff.createMarks(before, after);
    assert.isEmpty(prev.ranges);
    assert.equal(next.ranges.length, 1);

    const range = next.ranges[0];
    assertRange(range, 5, " to go".length);
  });

  test("text removed", () => {
    const [before, after] = ["sunday morning", "morning"];
    const [prev, next] = diff.createMarks(before, after);
    assert.isEmpty(next.ranges);
    assert.equal(prev.ranges.length, 1);

    assertRange(prev.ranges[0], 5, " to go".length);
  });

  test("hapy => happy, rabit => rabbit", () => {
    const [before, after] = ["hapy rabit", "happy rabbit"];
    const [prev, next] = diff.createMarks(before, after);
    assert.isEmpty(prev.ranges);

    const { ranges } = next;
    assert.equal(ranges.length, 2);

    // this is first 'p' in 'happy'
    assertRange(ranges[0], 2, 1);
    // this is first 'b' in 'rabbit'
    assertRange(ranges[0], 7, 1);
  });

  test("insertion + deletion", () => {
    /**
     * [-1,'o'],
     * [ 0,'n'],
     * [-1,'e'],
     * [ 1,'o'],
     * [ 0,' more '],
     * [-1,'tim'],
     * [1,'chanc'],
     * [0,'e'],
     * [1,'s']
     */
    const [prev, next] = diff.createMarks(
      "one more time", /// '_n_ more ___e'
      "no more chances" // 'n_ more ____e_'
    );
    // console.log(diff.diffs);
    assert.equal(prev.ranges.length, 3);
    assert.equal(next.ranges.length, 3);
    let { ranges } = prev;
    assertRange(ranges[0], 0, 1); // _ne more time
    assertRange(ranges[0], 2, 1); // on_ more time
    assertRange(ranges[0], 9, 3); // one more ___e

    ranges = next.ranges;
    assertRange(ranges[0], 1, 1); /// n_ more chances
    assertRange(ranges[0], 8, 4); /// no more ____es
    assertRange(ranges[0], 14, 1); // no more chance_
  });
});
