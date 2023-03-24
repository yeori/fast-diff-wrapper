import util from "../util";
import { DiffConfig } from "./DiffConfig";
import { IRange, IRangeReader, IRangeWriter } from "./Range";

class CharRange implements IRange {
  offset: number;
  length: number;
  line: IRange | null;
  constructor(offset: number, length: number, line: IRange | null = null) {
    this.offset = offset;
    this.length = length;
    this.line = line;
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
const resolveWordRange = (text: string, offset: number, delim: Set<string>) => {
  let lo = offset;
  // while (lo >= 0 && delim.has(text[lo])) {
  //   lo--;
  // }
  while (lo >= 0 && !delim.has(text[lo])) {
    lo--;
  }
  // lo = Math.max(0, lo); // prevent -1
  let hi = offset;
  while (hi < text.length && delim.has(text[hi])) {
    hi++;
  }
  while (hi < text.length && !delim.has(text[hi])) {
    hi++;
  }
  return new CharRange(lo + 1, hi - lo - 1);
};

export default class TextSource implements IRangeWriter, IRangeReader {
  readonly text: string;
  offset: number;
  readonly ranges: IRange[];
  private lineOffset: number;
  private config: DiffConfig;
  constructor(config: DiffConfig, text: string, offset: number = 0) {
    this.text = text;
    this.offset = offset;
    this.lineOffset = 0;
    this.ranges = [];
    this.config = config;
  }
  textAt(range: IRange): string {
    const { start, end } = range;
    return this.text.substring(start, end);
  }
  proceed(step: number) {
    this.offset += step;
    return this;
  }
  proceedLine(lineDelta: number) {
    this.lineOffset += lineDelta;
    return this;
  }
  addRange(text: string) {
    const numOfLines = util.countLines(text, this.config.lineDelimeter);
    const lines = new CharRange(this.lineOffset, numOfLines);
    this.ranges.push(new CharRange(this.offset, text.length, lines));
    this.proceed(text.length);
    return this;
  }
  getWordRanges(delim: string = " \t\n"): IRange[] {
    const delimSet = new Set<string>();
    delim.split("").reduce((set, char) => {
      set.add(char);
      return set;
    }, delimSet);

    const { text } = this;
    const ranges: IRange[] = [];
    let wordRange: CharRange | null = null;
    this.ranges.forEach((rng) => {
      if (!wordRange) {
        wordRange = resolveWordRange(text, rng.start, delimSet);
      }
      for (let k = rng.start; k < rng.end; k++) {
        if (wordRange.compare(k) > 0) {
          ranges.push(wordRange);
          wordRange = resolveWordRange(text, k, delimSet);
        }
      }
    });
    if (wordRange) {
      ranges.push(wordRange!);
    }
    return ranges;
  }
}
