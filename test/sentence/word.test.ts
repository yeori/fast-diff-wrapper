import { describe, test, assert } from "vitest";
import diff from "../../src";
import { assertRange } from "../helper";

describe("diff by characters", () => {
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
    let { ranges } = prev;
    assertRange(ranges[0], 0, 1); // _ne more time
    assertRange(ranges[0], 2, 1); // on_ more time
    assertRange(ranges[0], 9, 3); // one more ___e

    ranges = prev.getWordRanges();

    ranges = next.ranges;
    assertRange(ranges[0], 1, 1); /// n_ more chances
    assertRange(ranges[0], 8, 4); /// no more ____es
    assertRange(ranges[0], 14, 1); // no more chance_
  });
});
