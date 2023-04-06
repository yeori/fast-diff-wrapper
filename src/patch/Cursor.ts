import { IPatch } from "./Patch";
/**
 * used to traverse changes and retrieve text.
 */
export interface ICursor {
  /**
   * text to apply current patch
   */
  currentText: string;
  /**
   * if the cursor has any patches to apply forward
   */
  hasNext(): boolean;
  /**
   * return next text from currentText, then move cursor to next one.
   */
  next(): string;
  /**
   * If the cursor has any patches to apply backward
   */
  hasPrev(): boolean;
  /**
   * return previous text from currentText, then move cursor to prev one.
   */
  prev(): string;
}
const checkRange = ({ limit }: Cursor, pos: number) => {
  if (pos < 0 || pos >= limit) {
    throw new Error(
      `Out of bound: pos should be between [0,${limit}), but ${pos}`
    );
  }
};
export class Cursor implements ICursor {
  private pos: number;
  private text: string;
  constructor(
    readonly patches: IPatch[],
    readonly offset: number,
    readonly limit: number,
    baseText: string
  ) {
    this.pos = -1;
    this.text = baseText;
  }
  get currentText(): string {
    return this.text;
  }
  hasNext(): boolean {
    return this.pos + 1 < this.limit;
  }
  next(): string {
    checkRange(this, this.pos + 1);
    const patch = this.patches[++this.pos + this.offset];
    const patchedText = patch.run(this.text, false);
    return (this.text = patchedText);
  }
  hasPrev(): boolean {
    return this.pos >= this.offset;
  }
  prev(): string {
    checkRange(this, this.pos);
    const patch = this.patches[this.pos-- + this.offset];
    const patchedText = patch.run(this.text, true);
    return (this.text = patchedText);
  }
}
