import { Cursor, ICursor } from "./Cursor";
import { IPatch, Patch } from "./Patch";
import { UTCMillis } from "./schema";
import diff from "fast-diff";
import { IPatchContext } from "./PatchFactory";
export type TableId = "string" | number;
import { injectInterceptor } from "../event/array-proxy";
import { PatchEvent } from "../event/PatchEvent";
/**
 * means (F)orward or (B)ackward
 */
export type TableDir = "F" | "B"; // Forward | Backward
export interface IPatchTable {
  uid: TableId | undefined;
  creationTime?: UTCMillis;
  baseText: string;
  createPatch(text: string): IPatch;
  getCursor(): ICursor;
  delete(): void;
}
/**
 *
 */
export class BackwardPatchTable implements IPatchTable {
  creationTime: UTCMillis | undefined;
  baseText: string;
  private readonly patches: IPatch[];
  constructor(
    readonly ctx: IPatchContext,
    readonly uid: TableId | undefined,
    patches: IPatch[] | undefined,
    baseText: string = "",
    creationTime?: number | undefined
  ) {
    this.baseText = baseText;
    this.patches = injectInterceptor<IPatch>(
      patches || [],
      (type: string, patches: IPatch[] | undefined) => {
        const inserted = type === "I";
        const e: PatchEvent = {
          type: "patch",
          inserted,
          deleted: !inserted,
          patches,
          table: this,
        };
        this.ctx.dispatch(e);
      }
    );
    this.creationTime = creationTime || new Date().getUTCMilliseconds();
  }
  createPatch(text: string): IPatch {
    const diffs = diff(text, this.baseText);
    const patch = Patch.fromFastDiff(diffs);
    patch.tableRef = this.uid;
    this.patches.push(patch!);
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
  delete() {
    this.ctx.deleteTable(this);
  }
}
