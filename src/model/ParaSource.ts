import { DiffConfig } from "./DiffConfig";
import { IRange, Range, RangeType } from "./Range";

const TEXT_RANGE = 0;
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
export default class ParaSource {
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

  capture(newLine: boolean) {
    const cloned = new ParaSource(
      this.originText,
      this.config,
      this.type,
      this.lineNumber,
      this.globalOffset
    );
    cloned.offsetInPara = this.offsetInPara;
    cloned.ranges.push(...this.ranges);
    cloned.ranges.forEach((para) => {
      (para as RangeInPara).para = cloned;
    });

    if (newLine) {
      this.globalOffset += this.offsetInPara;
      this.offsetInPara = 0;
      this.lineNumber++;
      this.ranges.splice(0, this.ranges.length);
    }
    return cloned;
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

  splitPara(): IRange[] {
    if (this.ranges.length === 0) {
      return [new RangeInPara(0, this.offsetInPara, this, TEXT_RANGE)];
    }
    const tokens: IRange[] = [];
    let prev = this.ranges[0];
    if (prev.start > 0) {
      tokens.push(new RangeInPara(0, prev.start, this, TEXT_RANGE));
    }
    for (let k = 1; k < this.ranges.length; k++) {
      tokens.push(prev);
      const next = this.ranges[k];
      tokens.push(
        new RangeInPara(prev.end, next.start - prev.end, this, TEXT_RANGE)
      );
      prev = next;
    }
    tokens.push(prev);
    if (prev.end < this.offsetInPara) {
      tokens.push(
        new RangeInPara(
          prev.end,
          this.offsetInPara - prev.end,
          this,
          TEXT_RANGE
        )
      );
    }
    return tokens;
  }
}
