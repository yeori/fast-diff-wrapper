import InputSource from "./InputSource";
import { Diff, INSERT, DELETE, EQUAL } from "fast-diff";
import Mark from "./Mark";
export default class DiffContext {
  prev: InputSource;
  next: InputSource;
  diffs: Diff[];
  constructor(prev: InputSource, next: InputSource, diffs: Diff[]) {
    this.prev = prev;
    this.next = next;
    this.diffs = diffs;
  }

  buildMarks(): [Mark, Mark] {
    const prev = new Mark(this.prev);
    const next = new Mark(this.next);

    let df: number;
    let text: string;
    this.diffs.forEach((diff) => {
      [df, text] = diff;
      if (df === EQUAL) {
        prev.proceed(text);
        next.proceed(text);
      } else if (df === DELETE) {
        prev.addRange(text);
      } else if (df === INSERT) {
        next.addRange(text);
      } else {
        throw new Error("invalid diff value: " + df);
      }
    });
    return [prev, next];
  }
}
