export interface IRangeWriter {
  offset: number;
  proceed(step: number): IRangeWriter;
  addRange(text: string): IRangeWriter;
}
export interface IRangeReader {
  text: string;
  ranges: IRange[];
  textAt(range: IRange): string;
  getWordRanges(delim?: string): IRange[];
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

export interface RangeIterator {
  nextRange(): IRange;
}
