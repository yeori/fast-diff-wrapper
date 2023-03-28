import util from "../util";
import { DiffConfig } from "./DiffConfig";
import { IRange, Range, RangeType } from "./Range";

const UNCHANGED = 0;

export interface IParagraph {
  linenum: number;
  textOffset: number;
  length: number;
  paraText: string;
  ranges: IRange[];
  splitPara(): IRange[];
}
class RangeInPara extends Range {
  para: ParaSource;
  constructor(
    offset: number,
    length: number,
    para: ParaSource,
    readonly type: RangeType
  ) {
    super(offset, length);
    this.para = para;
  }
  get linenum() {
    return this.para.linenum;
  }
  get text() {
    return this.para.textBetween(this.start, this.end);
  }
}
export default class ParaSource implements IParagraph, IRange {
  private lineNumber = 0;
  private offsetInPara: number = 0;
  private globalOffset: number = 0;
  constructor(
    readonly originText: string,
    readonly config: DiffConfig,
    readonly type: RangeType,
    lineNumber: number = 0,
    globalOffset: number = 0,
    readonly ranges: IRange[] = []
  ) {
    this.originText = originText;
    this.lineNumber = lineNumber;
    this.globalOffset = globalOffset;
  }
  get linenum() {
    return this.lineNumber;
  }
  get textOffset() {
    const delimSize = this.config.lineDelimeter.length * this.lineNumber;
    return this.globalOffset + delimSize;
  }
  get length() {
    return this.offsetInPara;
  }
  get paraText() {
    return this.originText.substring(
      this.textOffset,
      this.textOffset + this.offsetInPara
    );
  }
  get offset() {
    return this.textOffset;
  }
  get start() {
    return this.textOffset;
  }
  get end() {
    return this.textOffset + this.offsetInPara;
  }
  get text() {
    return this.paraText;
  }
  compare(value: number): number {
    return util.compareRange(this.start, this.end, value);
  }
  textBetween(start: number, end: number) {
    start += this.textOffset;
    end += this.textOffset;
    return this.originText.substring(start, end);
  }
  proceed(length: number) {
    this.offsetInPara += length;
  }
  addRange(text: string) {
    const range = new RangeInPara(
      this.offsetInPara,
      text.length,
      this,
      this.type
    );
    this.ranges.push(range);
    this.proceed(text.length);
  }
  createNextPara() {
    return new ParaSource(
      this.originText,
      this.config,
      this.type,
      this.lineNumber + 1,
      this.globalOffset + this.offsetInPara
    );
  }
  /**
   * returns all ranges including unchanged text.
   *
   * When two ranges exist,
   * ```
   * ex) "Here is test sentence."
   *    [-1, offset: 5, len:2] // "is"
   *    [-1, offset:13, len:3] // "sen"
   * ```
   * it will include unchanged ranges
   *
   * ```
   * [ 0, offset: 0, len: 5] // "Here "
   * [-1, offset: 5, len: 2] // "is"
   * [ 0, offset: 7, len: 6] // " test "
   * [-1, offset:13, len: 3] // "sen"
   * [ 0, offset:16, len: 6] // " tense."
   * ```
   * @returns
   */
  splitPara(): IRange[] {
    if (this.ranges.length === 0) {
      return [new RangeInPara(0, this.offsetInPara, this, UNCHANGED)];
    }
    const tokens: IRange[] = [];
    let prev = this.ranges[0];
    if (prev.start > 0) {
      // unchanged region exists.
      tokens.push(new RangeInPara(0, prev.start, this, UNCHANGED));
    }
    for (let k = 1; k < this.ranges.length; k++) {
      tokens.push(prev);
      const next = this.ranges[k];
      tokens.push(
        new RangeInPara(prev.end, next.start - prev.end, this, UNCHANGED)
      );
      prev = next;
    }
    tokens.push(prev);
    if (prev.end < this.offsetInPara) {
      tokens.push(
        new RangeInPara(prev.end, this.offsetInPara - prev.end, this, UNCHANGED)
      );
    }
    return tokens;
  }
}
