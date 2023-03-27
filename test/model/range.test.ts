import { describe, test, expect } from "vitest";
import { DiffConfig } from "../../src/model/DiffConfig";
import { DiffTable } from "../../src/model/DiffTable";
import { assertRange } from "../helper";

const config: DiffConfig = {
  lineDelimeter: "\n",
};
describe("range", () => {
  test("para info", () => {
    const table = new DiffTable(config).build("abcDefG", "ABCDEFG");
    const { prev, next } = table.at(0);

    {
      const { ranges } = prev;
      expect(ranges.length).toBe(2);
      assertRange(ranges[0], { offset: 0, length: 3, text: "abc" });
      assertRange(ranges[1], { offset: 4, length: 2, text: "ef" });
    }
    {
      const ranges = prev.splitPara();
      expect(ranges.length).toBe(4);
      assertRange(ranges[0], { text: "abc", type: -1 });
      assertRange(ranges[1], { text: "D", type: 0 });
      assertRange(ranges[2], { text: "ef", type: -1 });
      assertRange(ranges[3], { text: "G", type: 0 });
    }
    {
      const { ranges } = next;
      expect(ranges.length).toBe(2);
      assertRange(ranges[0], { offset: 0, length: 3, text: "ABC" });
      assertRange(ranges[1], { offset: 4, length: 2, text: "EF" });
    }
    {
      const ranges = next.splitPara();
      expect(ranges.length).toBe(4);
      assertRange(ranges[0], { text: "ABC", type: 1 });
      assertRange(ranges[1], { text: "D", type: 0 });
      assertRange(ranges[2], { text: "EF", type: 1 });
      assertRange(ranges[3], { text: "G", type: 0 });
    }
  });
});
