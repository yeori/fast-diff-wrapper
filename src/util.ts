import type { Diff } from "fast-diff";

/**
 * split diff with deliemter
 *
 * ```
 * [M, "AB\nCD\nEF"]
 *  =>
 * [
 *   [M, "AB"],
 *   [M, "\n"],
 *   [M, "CD"],
 *   [M, "\n"],
 *   [M, "EF"]
 * },
 * where M = +1|0|-1
 * ```
 * @param diff
 * @param delim
 * @returns arrays of diffs
 */
const normalizeDiff = (diff: Diff, delim: string): Diff[] => {
  const paraDiffs: Diff[] = [];
  diff[1].split(delim).forEach((token) => {
    paraDiffs.push([diff[0], token]);
    paraDiffs.push([diff[0], delim]);
  });
  paraDiffs.splice(paraDiffs.length - 1);
  return paraDiffs.filter((diff) => diff[1].length > 0);
};

const toParaDiff = (
  originDiffs: Diff[],
  lineDelimeter: string = "\n"
): Diff[] =>
  originDiffs.flatMap((originDiff: Diff) =>
    normalizeDiff(originDiff, lineDelimeter)
  );

export default { normalizeDiff, toParaDiff };
