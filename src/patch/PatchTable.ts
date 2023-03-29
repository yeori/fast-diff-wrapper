import { Cursor, ICursor } from "./Cursor";
import { IPatch, Patch } from "./Patch";
import { UTCMillis } from "./schema";
import diff from "fast-diff";
export type TableId = "string" | number;
/**
 * means (F)orward or (B)ackward
 */
export type TableDir = "F" | "B"; // Forward | Backward
export interface IPatchTable {
  uid: TableId;
  creationTime?: UTCMillis;
  baseText: string;
  createPatch(text: string): IPatch;
  getCursor(): ICursor;
}
/**
 *
 */
export class BackwardPatchTable implements IPatchTable {
  creationTime: UTCMillis | undefined;
  baseText: string;
  private patches: IPatch[];
  constructor(
    readonly uid: TableId,
    patches: IPatch[] | undefined,
    baseText: string = "",
    creationTime?: number | undefined
  ) {
    this.baseText = baseText;
    this.patches = patches || [];
    this.creationTime = creationTime || new Date().getUTCMilliseconds();
  }
  createPatch(text: string): IPatch {
    const diffs = diff(text, this.baseText);
    const patch = Patch.fromFastDiff(diffs);
    patch.tableRef = this.uid;
    this.patches.push(patch);
    this.baseText = text;
    return patch;
  }
  getCursor(): ICursor {
    return new Cursor(
      this.patches.reverse(),
      0,
      this.patches.length,
      this.baseText
    );
  }
}
