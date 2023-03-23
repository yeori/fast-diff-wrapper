import InputSource from "./InputSource";
import { IRange } from "./Range";

class CharRange implements IRange {
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
export default class Mark {
  private offset: number;
  readonly ref: InputSource;
  readonly ranges: IRange[];

  constructor(ref: InputSource, offset: number = 0) {
    this.ref = ref;
    this.offset = offset;
    this.ranges = [];
  }
  proceed(text: string) {
    this.offset += text.length;
  }

  addRange(text: string) {
    this.ranges.push(new CharRange(this.offset, text.length));
    this.proceed(text);
  }

  getWordRanges(delim: string = " \t\n"): IRange[] {
    const delimSet = new Set<string>();
    delim.split("").reduce((set, char) => {
      set.add(char);
      return set;
    }, delimSet);

    const { text } = this.ref;
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
