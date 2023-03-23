import { describe, test, assert } from "vitest";
import diff from "../../src";
// import DiffContext from "../../src/model/DiffContext";

describe("Mark", () => {
  test("deletion in a word", () => {
    const [prev, next] = diff.createMarks(
      // deleted: [ABCDefGH] [iJKLmn]
      "ABCDefGH iJKLmn XYZ",
      "ABCDGH JKL XYZ"
    );
    // no addition to next
    assert.equal(next.ranges.length, 0);

    let ranges = prev.getWordRanges();
    assert.equal(ranges.length, 2);
    assert.equal(prev.ref.textAt(ranges[0]), "ABCDefGH");
    assert.equal(prev.ref.textAt(ranges[1]), "iJKLmn");
  });

  test("deletion across words", () => {
    const [prev, next] = diff.createMarks(
      // deleted: [CDef] [ghij] [xYZ]
      "AB CDef ghij xYZ",
      "AB CDYZ"
    );
    // no addition to next
    assert.equal(next.ranges.length, 0);

    let ranges = prev.getWordRanges();

    assert.equal(ranges.length, 3);
    assert.equal(prev.ref.textAt(ranges[0]), "CDef");
    assert.equal(prev.ref.textAt(ranges[1]), "ghij");
    assert.equal(prev.ref.textAt(ranges[2]), "xYZ");
  });

  test("addition in a word", () => {
    const [prev, next] = diff.createMarks(
      "B DGKM XYZ",
      // aded at: [CDef] [ghij] [xYZ]
      "aBc DefGhijKM XYZ"
    );
    // no deletion from prev
    assert.equal(prev.ranges.length, 0);

    let ranges = next.getWordRanges();
    assert.equal(ranges.length, 2);
    assert.equal(next.ref.textAt(ranges[0]), "aBc");
    assert.equal(next.ref.textAt(ranges[1]), "DefGhijKM");
  });

  test("addition across word", () => {
    const [prev, next] = diff.createMarks(
      "AIJ",
      // result: [Abc] [def] [ghIJ]
      "Abc def ghIJ"
    );
    // no deletion from prev
    assert.equal(prev.ranges.length, 0);

    let ranges = next.getWordRanges();
    assert.equal(ranges.length, 3);
    assert.equal(next.ref.textAt(ranges[0]), "Abc");
    assert.equal(next.ref.textAt(ranges[1]), "def");
    assert.equal(next.ref.textAt(ranges[2]), "ghIJ");
  });
});
