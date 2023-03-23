import { IRange } from "./Range";

export default class InputSource {
  readonly text: string;
  constructor(text: string) {
    this.text = text;
  }
  textAt(range: IRange): string {
    const { start, end } = range;
    return this.text.substring(start, end);
  }
}
