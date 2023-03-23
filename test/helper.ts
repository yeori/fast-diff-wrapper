import { assert } from "vitest";
import { IRange } from "../src/model/Range";

export const assertRange = (range: IRange, offset: number, length: number) => {
  return range.offset === offset && range.length === length;
};

export default { assertRange };
