import util from "../util";

export type RangeType = -1 | 0 | 1;
export abstract class Range implements IRange {
  abstract linenum: number;
  abstract text: string;
  abstract type: RangeType;
  readonly offset: number;
  readonly length: number;
  constructor(offset: number, length: number) {
    this.offset = offset;
    this.length = length;
  }

  get start() {
    return this.offset;
  }
  get end() {
    return this.offset + this.length;
  }
  compare(pos: number) {
    return util.compareRange(this.start, this.end, pos);
  }
}

export interface IRange {
  /**
   * relative position from enclosing entity(whole text, or paragraph)
   */
  offset: number;
  /**
   * relative length from offset
   */
  length: number;
  /**
   * same with offset.
   */
  start: number;
  /**
   * absolute offset from enclosing entity(offset + length)
   */
  end: number;
  /**
   * line number where it is located
   */
  linenum: number;
  /**
   * text at [start, end)
   */
  text: string;
  /**
   *  -1 | 0 | +1
   * ```
   * -1) DELETE
   *  0) UNCHANGED
   * +1) INSERT
   * ```
   */
  type: RangeType;
  /**
   * ```
   *          start        end
   * -----------[-----------)--------
   *  negative  |   zero    ) positive
   *```
   * returns
   * 1) negative if value < start
   * 2) zero     if start <= value < end
   * 3) positive if value >= end
   *
   * @param value negative , zero  positive
   */
  compare(value: number): number;
}
