import { describe, expect, test } from "vitest";
import { DiffTable } from "../../src/model/DiffTable";

describe("para diff", () => {
  test("dddd", () => {
    /**
    [0,"He"],
    [-1,"llo\nMagic"],
    [1,"re"],
    [0," "],
    [-1,"W"],
    [1,"is\nY"],
    [0,"o"],
    [1,"u"],
    [0,"r"],
    [-1,"l"],
    [1," Min"],
    [0,"d"]


                   prev      next
    [ 0,"He"],     0         0  ++
    [-1,"llo"],    0
    [-1,"\n"],     1         0  <<
    [-1,"Magic"],  1
    [ 1,"re"],               0
    [ 0," "],      1         0  ++
    [-1,"W"],      1
    [ 1,"is"],               0
    [ 1,"\n"],     1         1  <<
    [ 1,"Y"],                1
    [ 0,"o"],      1         1  ++
    [ 1,"u"],                1
    [ 0,"r"],      1         1  ++
    [-1,"l"],      1
    [ 1," Min"],             1
    [ 0,"d"]       1         1 ++


                     [ 0,"He"],
    [-1,"llo"],
    [-1,"\n"],
    [-1,"Magic"],
    [ 1,"re"],
    [ 0," "],
    [-1,"W"],
    [ 1,"is"],
    [ 1,"\n"],
    [ 1,"Y"],
    [ 0,"o"],
    [ 1,"u"],
    [ 0,"r"],
    [-1,"l"],
    [ 1," Min"],
    [ 0,"d"]

    0: Hello        0: Here_is
    1: Magic_Word   1: Your Mind

    L0 --> R0,
    R0 --> L1

    [0, 0]
    [1, 0]     
    [1, 1]

    0 ------ 0
           /
         /
        /
       /
     /
    1 ------ 1

    pair(0, 0)
    => [0, 0]

    pair(1, 0)
    => [0, 0]
    => [1, null]

    pair(1, 1)
    => [0, 0]
    => [1, 1]
    

     */
    const prev = `Hello\nMagic World`;
    const next = `Here is\nYour Mind`;

    const table = new DiffTable({ lineDelimeter: "\n" });
    const pairs = table.build(prev, next).getPairs({ skipSamePara: false });
    pairs.forEach(({ prev, next }) => {
      console.log("[P]", prev?.paraText, "/", next?.paraText);
      // console.log("[N]", next?.ranges);
    });
  });

  test("case 2", () => {
    const prev = "abcdefxyz";
    const next = "abc\ndef\nxyz";
    const table = new DiffTable({ lineDelimeter: "\n" });
    const pairs = table.build(prev, next).getPairs({ skipSamePara: false });
    expect(pairs.length).toBe(3);
    pairs.forEach(({ prev, next }) => {
      console.log("[P]", prev?.paraText, "/", next?.paraText);
      // console.log("[N]", next?.ranges);
    });
  });

  test("single line error", () => {
    const prev = "";
    const next = "abc";
    const table = new DiffTable({ lineDelimeter: "\n" });
    const pairs = table.build(prev, next).getPairs({ skipSamePara: false });
    expect(pairs.length).toBe(1);
    expect(pairs[0].prev).toBeDefined();
    expect(pairs[0].next).toBeDefined();
  });
});
