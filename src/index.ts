import diff from "fast-diff";
import type { Diff } from "fast-diff";
import DiffContext from "./model/DiffContext";
import InputSource from "./model/InputSource";
import type Mark from "./model/Mark";

const createMarks = (prev: string, next: string): [Mark, Mark] => {
  const src = new InputSource(prev);
  const dst = new InputSource(next);
  const changes: Diff[] = diff(prev, next);
  const ctx = new DiffContext(src, dst, changes);
  return ctx.buildMarks();
};
export default { createMarks };
