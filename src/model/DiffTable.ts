import diff from "fast-diff";
import { Diff, EQUAL, DELETE, INSERT } from "fast-diff";
import util from "../util";
import { DiffConfig } from "./DiffConfig";
import ParaSource, { IParagraph } from "./ParaSource";
import { RangeType } from "./Range";
/**
 * a pair of paragraph where a change has occurred.
 */
export type ParaPair = {
  prev: IParagraph | undefined;
  next: IParagraph | undefined;
};
type LineMap = {
  prevIndex: number | undefined;
  nextIndex: number | undefined;
};

class ParaBuilder {
  target: ParaSource | undefined;

  constructor(
    readonly originText: string,
    readonly config: DiffConfig,
    readonly type: RangeType
  ) {
    this.target = undefined;
  }
  get lineNumber() {
    return this.target ? this.target.linenum : -1;
  }
  private initTarget() {
    if (!this.target) {
      this.target = new ParaSource(this.originText, this.config, this.type);
    }
  }
  addRange(text: string) {
    this.initTarget();
    this.target!.addRange(text);
  }
  skip(text: string) {
    this.initTarget();
    this.target!.proceed(text.length);
  }
  capture() {
    this.initTarget();
    const para = this.target!;
    this.target = para.createNextPara();
    return para;
  }
}
export class DiffTable {
  private readonly pairs: Array<LineMap> = [];
  private readonly prevParas: IParagraph[] = [];
  private readonly nextParas: IParagraph[] = [];
  constructor(readonly config: DiffConfig) {}
  private addPair(prev: ParaSource, next: ParaSource) {
    this.pairs.push({ prevIndex: prev.linenum, nextIndex: next.linenum });
    this.prevParas.push(prev);
    this.nextParas.push(next);
    prev.addNeighbor(next.linenum);
    next.addNeighbor(prev.linenum);
  }
  private addRight(prevIndex: number, para: ParaSource) {
    this.pairs.push({ prevIndex, nextIndex: para.linenum });
    this.nextParas.push(para);
    if (prevIndex >= 0) {
      para.addNeighbor(prevIndex);
      // const prev = this.prevParas[prevIndex] as ParaSource;
      // prev.addNeighbor(para.linenum);
    }
  }
  private addLeft(para: ParaSource, nextIndex: number) {
    this.pairs.push({ prevIndex: para.linenum, nextIndex });
    this.prevParas.push(para);
    if (nextIndex >= 0) {
      para.addNeighbor(nextIndex);
      // const next = this.prevParas[nextIndex] as ParaSource;
      // next.addNeighbor(para.linenum);
    }
  }
  /**
   * the number of paragraph pairs.
   */
  get length() {
    return this.pairs.length;
  }
  /**
   * returns a pair of paragraphs at the given position.
   * @param idx position of paragraph
   * @returns a pair of paragraph
   */
  at(idx: number) {
    const pair = this.pairs[idx];
    const prev = this.prevParas[pair.prevIndex!];
    const next = this.nextParas[pair.nextIndex!];
    return { prev, next };
  }
  /**
   * It constructs change histories from the given two texts.
   * @param prevText original text
   * @param nextText text after editing original text
   * @returns table with change histories
   */
  build(prevText: string, nextText: string): DiffTable {
    const prev = new ParaBuilder(prevText, this.config, -1);
    const next = new ParaBuilder(nextText, this.config, +1);

    const delim = this.config.lineDelimeter;
    const diffs: Diff[] = util.toParaDiff(diff(prevText, nextText), delim);
    this.clear();
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
          this.addRight(prev.lineNumber, nextRef);
        } else {
          throw new Error("invalid diff value: " + type);
        }
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
  getPairs(option: { skipSamePara: boolean }) {
    option = option;
    let line = { L: -1, R: -1 } as {
      L: number | undefined;
      lastL: number | undefined;
      R: number | undefined;
      lastR: number | undefined;
      merged: boolean;
    };

    let pairs: ParaPair[] = [];
    if (this.pairs.length > 0) {
      line.L = line.lastL = this.pairs[0].prevIndex;
      line.R = line.lastR = this.pairs[0].nextIndex;
    }
    for (let k = 1; k < this.pairs.length; k++) {
      //         0 0
      // 0 1     u 1
      // 1 1     1 u
      const pair = this.pairs[k];
      line.merged = false;
      if (line.L === undefined) {
        if (line.R === pair.nextIndex) {
          line.L = pair.prevIndex;
          line.merged = true;
        } else {
          line.L = -1;
        }
      } else if (line.R === undefined) {
        if (line.L === pair.prevIndex) {
          line.R = pair.nextIndex;
          line.merged = true;
        } else {
          line.R = -1;
        }
      }
      if (line.L === undefined && line.R === undefined) {
        throw new Error("bug!");
      }
      // if (line.L !== undefined && line.R !== undefined) {
      //   // line.L and line.R !== undefined

      // }
      pairs.push({
        prev: this.prevParas[line.L!],
        next: this.nextParas[line.R!],
      });
      line.L = line.lastL === pair.prevIndex ? undefined : pair.prevIndex;
      line.R = line.lastR === pair.nextIndex ? undefined : pair.nextIndex;
      if (line.lastL !== pair.prevIndex) {
        line.lastL = pair.prevIndex;
      }
      if (line.lastR !== pair.nextIndex) {
        line.lastR = pair.nextIndex;
      }
    }
    if (!line.merged) {
      pairs.push({
        prev: this.prevParas[line.L === undefined ? -1 : line.L],
        next: this.nextParas[line.R === undefined ? -1 : line.R],
      });
    }
    return pairs;
  }
  /**
   * callback for each (prev, next) line
   *
   * ```javascript
   *
   * table.eachLine(({prev, next}) => {
   *   console.log('[PREV]', prev.ranges)
   *   console.log('[NEXT]', next.ranges)
   * })
   * ```
   * @param consumer
   */
  eachLine(consumer: (pair: ParaPair) => void) {
    this.pairs.forEach((pair) => {
      const prev =
        this.prevParas[pair.prevIndex === undefined ? -1 : pair.prevIndex];
      const next =
        this.nextParas[pair.nextIndex === undefined ? -1 : pair.nextIndex];
      consumer({ prev, next });
    });
  }
  clear() {
    this.prevParas.splice(0, this.prevParas.length);
    this.nextParas.splice(0, this.nextParas.length);
    this.pairs.splice(0, this.pairs.length);
  }
}
