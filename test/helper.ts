import { assert, expect } from "vitest";
import { IRange, RangeType } from "../src/model/Range";
import type { Diff } from "fast-diff";
import ParaSource from "../src/model/ParaSource";
import { DiffTable } from "../src/model/DiffTable";

/**
 * test Range in ParaSource
 * @param range
 * @param param1
 * @returns
 */
export const assertRange = (
  range: IRange,
  {
    offset = undefined,
    length = undefined,
    text = undefined,
    type = undefined,
  }: {
    offset?: number | undefined;
    length?: number | undefined;
    text?: string | undefined;
    type?: RangeType | undefined;
  }
) => {
  if (offset !== undefined) {
    assert.equal(
      range.offset,
      offset,
      `range offset mismatch. expected (${offset}), but (${range.offset})`
    );
  }
  if (length !== undefined) {
    assert.equal(
      range.length,
      length,
      `range length mismatch. expected (${length}), but (${range.length})`
    );
  }
  if (text !== undefined) {
    assert.equal(
      range.text,
      text,
      `range text mismatch. expected (${text}), but (${range.text})`
    );
  }
  if (type !== undefined) {
    assert.equal(
      range.type,
      type,
      `range type mismatch. expected (${type}), but (${range.type})`
    );
  }
};

export const assertEmptyPara = (para: ParaSource) => {
  assert.equal(para.ranges.length, 0);
};
export const assertPara = (
  para: ParaSource,
  { line, offset, length }: { line: number; offset: number; length: number }
) => {
  expect(para.linenum).toEqual(line);
  expect(para.textOffset).toEqual(offset);
  expect(para.length).toEqual(length);
};

export const assertLineMap = (
  table: DiffTable,
  lines: Array<[number, number]>
) => {
  assert.equal(
    table.length,
    lines.length,
    `table row mismatch; expected ${lines.length}, but ${table.length}.`
  );
  lines.forEach(([prevIdx, nextIdx], idx) => {
    const { prev, next } = table.at(idx);
    assert.isTrue(
      prev.linenum === prevIdx,
      `linenum mismatch; prev at row: ${idx}, expected(${prevIdx}), but(${prev.linenum})`
    );
    assert.isTrue(
      next.linenum === nextIdx,
      `linenum mismatch; next at row: ${idx}, expected(${nextIdx}), but(${next.linenum})`
    );
  });
};

const assertDiffs = (diffs: Diff[], texts: string[]) => {
  assert.equal(
    diffs.length,
    texts.length,
    `diff size mismatch; expected ${diffs.length} but ${texts.length}`
  );
  diffs.forEach((df, idx) => {
    assert.equal(
      df[1],
      texts[idx],
      `diff value mismatch; at [${idx}]. expected [${df[1]}] but [${texts[idx]}]`
    );
  });
};
export default {
  assertEmptyPara,
  assertDiffs,
};
