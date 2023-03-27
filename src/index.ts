import { DiffConfig } from "./model/DiffConfig";
import util from "./util";
import diff from "fast-diff";
import type { Diff } from "fast-diff";
import { DiffTable } from "./model/DiffTable";

const paraDiff = (
  prev: string,
  next: string,
  lineDelimeter: string = "\n"
): Diff[] => {
  const diffs: Diff[] = diff(prev, next);
  return util.toParaDiff(diffs, lineDelimeter);
};

const createDiffTable = (
  prev: string,
  next: string,
  lineDelimeter: string = "\n"
): DiffTable => {
  const config: DiffConfig = {
    lineDelimeter,
  };
  const table = new DiffTable(config);
  table.build(prev, next);
  return table;
};

export default { /* createMarks, */ paraDiff, createDiffTable };
