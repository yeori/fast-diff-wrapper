import { describe, test, expect } from "vitest";
import type { DiffConfig } from "../../src/model/DiffConfig";
import { DiffTable } from "../../src/model/DiffTable";
import {
  assertEmptyPara,
  assertLineMap,
  assertRange,
  assertPara,
} from "../helper";
const config: DiffConfig = {
  lineDelimeter: "\n",
};
describe("ParaSource offset length", () => {
  test("case 1", () => {
    /*
      [cde\nfghi] => [CDE\nFGHI]
      0:ab     0:ab
      1:cde    1:CDE
      2:fghi   2:FGHI
    */
    const pairs = new DiffTable(config).build("ab\ncde\nfghi", "ab\nCDE\nFGHI");

    assertLineMap(pairs, [
      [0, 0],
      [1, 1],
      [2, 2],
    ]);

    {
      // ab.., ab...
      let { prev, next } = pairs.at(0);
      assertEmptyPara(prev!);
      assertEmptyPara(next!);
      assertPara(prev!, { line: 0, offset: 0, length: 2 });
      assertPara(next!, { line: 0, offset: 0, length: 2 });
    }
    {
      // ..\ncde.., ..\nCDE..
      let { prev, next } = pairs.at(1);
      assertPara(prev!, { line: 1, offset: 1 + 2, length: 3 });
      assertPara(next!, { line: 1, offset: 1 + 2, length: 3 });
    }
    {
      // ..\nfghi, ..\nFGHI
      let { prev, next } = pairs.at(2);
      assertPara(prev!, { line: 2, offset: 2 + 5, length: 4 });
      assertPara(next!, { line: 2, offset: 2 + 5, length: 4 });
    }
  });
  test("case 2", () => {
    /*
      [c\ndef\ng] => [XYZ]
      0: abc  0:abXYZhi
      1: def
      2: ghi
    */
    const table = new DiffTable(config).build("abc\ndef\nghi", "abXYZhi");
    assertLineMap(table, [
      [0, 0],
      [1, 0],
      [2, 0],
    ]);

    {
      let { prev, next } = table.at(0);
      assertPara(prev!, { line: 0, offset: 0, length: 3 });
      assertPara(next!, { line: 0, offset: 0, length: 7 });
    }
    {
      let { prev } = table.at(1);
      assertPara(prev!, { line: 1, offset: 1 + 3, length: 3 }); // def
    }
    {
      let { prev } = table.at(2);
      assertPara(prev!, { line: 2, offset: 2 + 6, length: 3 }); // ghi
    }
  });
  test("case 3", () => {
    /*
      [by] => [B\nCDE\nFGH]
      0: abyz  0: aB
               1: CDE
               2: FGHz
    */
    const table = new DiffTable(config).build("abyz", "aB\nCDE\nFGHz");
    assertLineMap(table, [
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    {
      let { prev, next } = table.at(0);
      assertPara(prev, { line: 0, offset: 0, length: 4 }); // abyz
      assertPara(next, { line: 0, offset: 0, length: 2 }); // aB
      // range
      assertRange(prev.ranges[0], { offset: 1, length: 2 }); // a[by]
      assertRange(next.ranges[0], { offset: 1, length: 1 }); // a[B]
    }
    {
      const { next } = table.at(1);
      assertPara(next, { line: 1, offset: 3, length: 3 }); // CDE
      assertRange(next.ranges[0], { offset: 0, length: 3 }); // [CDE]
    }
    {
      const { prev, next } = table.at(2);
      assertPara(prev, { line: 0, offset: 0, length: 4 }); // FGHz
      assertRange(prev.ranges[0], { offset: 1, length: 2, text: "by" });

      assertPara(next, { line: 2, offset: 7, length: 4 }); // FGHz
      assertRange(next.ranges[0], { offset: 0, length: 3 }); // [FGH]z
    }
  });

  test("case 4", () => {
    /*
      [by] => [B\nCDE\nFGH]
      0:abcdef   0:aBCD
      1:ghi      1:EF
                 2:gHI

      0:[0, 'a']
      1:[-1, 'bcdef']
      2:[1, 'BCD\nEF']
      3:[0, '\ng']
      4:[-1, 'hi']
      5:[1, 'HI']

              0a,
    -bcdef
                    +BCD
                    +@
                    +EF
              0@
              0g
    -hi
                    +HI
    */
    const table = new DiffTable(config).build("abcdef\nghi", "aBCD\nEF\ngHI");
    assertLineMap(table, [
      [0, 0],
      [0, 1],
      [1, 2],
    ]);

    // {
    //   let { prev, next } = table.at(0);
    //   assertPara(prev!, { line: 0, offset: 0, length: 4 }); // abyz
    //   assertPara(next!, { line: 0, offset: 0, length: 2 }); // aB
    //   // range
    //   assertRange(prev.ranges[0], { offset: 1, length: 2 }); // a[by]
    //   assertRange(next.ranges[0], { offset: 1, length: 1 }); // a[B]
    // }
    // {
    //   const { next } = table.at(1);
    //   assertPara(next, { line: 1, offset: 3, length: 3 }); // CDE
    //   assertRange(next.ranges[0], { offset: 0, length: 3 }); // [CDE]
    // }
    // {
    //   const { prev, next } = table.at(2);
    //   assertPara(prev, { line: 0, offset: 0, length: 4 }); // FGHz
    //   assertRange(prev.ranges[0], { offset: 1, length: 2, text: "by" });

    //   assertPara(next, { line: 2, offset: 7, length: 4 }); // FGHz
    //   assertRange(next.ranges[0], { offset: 0, length: 3 }); // [FGH]z
    // }
  });
  test("case single line", () => {
    const table = new DiffTable(config).build("abc", "abcD");
    table.eachLine(({ prev, next }) => {
      console.log(prev!.splitPara().map((para) => para.text));
      console.log(next!.splitPara().map((para) => para.text));
    });
  });
});
