import TextSource from "./TextSource";
import diff, { Diff, INSERT, DELETE, EQUAL } from "fast-diff";
import util from "../util";
import { DiffConfig } from "./DiffConfig";

export default class DiffContext {
  config: DiffConfig;
  constructor(config: DiffConfig) {
    this.config = config;
  }

  build(prevText: string, nextText: string): [TextSource, TextSource, Diff[]] {
    const diffs: Diff[] = diff(prevText, nextText);
    const prev = new TextSource(this.config, prevText);
    const next = new TextSource(this.config, nextText);
    let df: number;
    let text: string;
    diffs.forEach((diff) => {
      [df, text] = diff;
      const lines = util.countLines(text, this.config.lineDelimeter);
      if (df === EQUAL) {
        prev.proceed(text.length).proceedLine(lines);
        next.proceed(text.length).proceedLine(lines);
      } else if (df === DELETE) {
        prev.addRange(text);
      } else if (df === INSERT) {
        next.addRange(text);
      } else {
        throw new Error("invalid diff value: " + df);
      }
    });
    return [prev, next, diffs];
  }
}
