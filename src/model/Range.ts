export type RangeType = -1 | 0 | 1;
export abstract class Range implements IRange {
  abstract linenum: number;
  abstract text: string;
  abstract type: RangeType;
  offset: number;
  length: number;
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
    if (this.start > pos) {
      return -1;
    } else if (this.end <= pos) {
      return 1;
    } else {
      return 0;
    }
  }
}

export interface IRange {
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
   * absolute offset from the text. (offset + length)
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
