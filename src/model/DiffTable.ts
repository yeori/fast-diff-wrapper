import diff from "fast-diff";
import { Diff, EQUAL, DELETE, INSERT } from "fast-diff";
import util from "../util";
import { DiffConfig } from "./DiffConfig";
import ParaSource from "./ParaSource";
import { RangeType } from "./Range";

export type ParaPair = {
  prev: ParaSource | undefined;
  next: ParaSource | undefined;
};
type LineMap = {
  prevIndex: number;
  nextIndex: number;
};

class ParaBuilder {
  target: ParaSource;

  constructor(
    readonly originText: string,
    readonly config: DiffConfig,
    readonly type: RangeType
  ) {
    this.target = new ParaSource(originText, config, this.type);
  }
  get lineNumber() {
    return this.target.linenum;
  }
  addRange(text: string) {
    this.target.addRange(text);
  }
  skip(text: string) {
    this.target.proceed(text.length);
  }
  capture() {
    const para = this.target;
    this.target = para.createNextPara();
    return para;
  }
}
export class DiffTable {
  private readonly pairs: Array<LineMap> = [];
  private readonly prevParas: ParaSource[] = [];
  private readonly nextParas: ParaSource[] = [];
  constructor(readonly config: DiffConfig) {}
  addPair(prev: ParaSource, next: ParaSource) {
    this.pairs.push({ prevIndex: prev.linenum, nextIndex: next.linenum });
    this.prevParas.push(prev);
    this.nextParas.push(next);
  }
  private addRight(para: ParaSource, prevIndex: number) {
    this.pairs.push({ prevIndex, nextIndex: para.linenum });
    this.nextParas.push(para);
  }
  private addLeft(para: ParaSource, nextIndex: number) {
    this.pairs.push({ prevIndex: para.linenum, nextIndex });
    this.prevParas.push(para);
  }
  get length() {
    return this.pairs.length;
  }
  at(idx: number) {
    const pair = this.pairs[idx];
    const prev = this.prevParas[pair.prevIndex];
    const next = this.nextParas[pair.nextIndex];
    return { prev, next };
  }
  build(prevText: string, nextText: string): DiffTable {
    // const table = this;
    const prev = new ParaBuilder(prevText, this.config, -1);
    const next = new ParaBuilder(nextText, this.config, +1);

    const delim = this.config.lineDelimeter;
    const diffs: Diff[] = util.toParaDiff(diff(prevText, nextText), delim);
    // console.log(diffs);
    diffs.forEach(([type, text]) => {
      if (text === delim) {
        let prevRef, nextRef;
        if (type === EQUAL) {
          prevRef = prev.capture();
          nextRef = next.capture();
          this.addPair(prevRef, nextRef);
        } else if (type == DELETE) {
          prevRef = prev.capture();
          this.addLeft(prevRef, next.lineNumber);
        } else if (type === INSERT) {
          nextRef = next.capture();
          this.addRight(nextRef, prev.lineNumber);
        } else {
          throw new Error("invalid diff value: " + type);
        }
        // this.addPair(prevRef!, nextRef!);
      } else {
        if (type === EQUAL) {
          prev.skip(text);
          next.skip(text);
        } else if (type == DELETE) {
          prev.addRange(text);
        } else if (type === INSERT) {
          next.addRange(text);
        } else {
          throw new Error("invalid diff value: " + type);
        }
      }
    });
    this.addPair(prev.capture(), next.capture());
    return this;
  }
  forEach(consumer: (pair: ParaPair) => void) {
    // let prevCache: ParaSource | undefined = undefined,
    //   nextCache: ParaSource | undefined = undefined;
    this.pairs.forEach((pair) => {
      // let prev: ParaSource | undefined = this.prevParas[pair.prevIndex];
      // let next: ParaSource | undefined = this.nextParas[pair.nextIndex];
      // prev = prev === prevCache ? undefined : prev;
      // next = next === nextCache ? undefined : next;
      // prevCache = prev;
      // nextCache = next;
      const prev = this.prevParas[pair.prevIndex];
      const next = this.nextParas[pair.nextIndex];
      consumer({ prev, next });
    });
  }
}
