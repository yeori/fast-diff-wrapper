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
  /**
   * This attribute defines how the cursor moves.
   *
   * For backward("B"), the cursor.next() moves to the previous history.
   */
  direction: TableDir;
  creationTime?: UTCMillis;
  baseText: string;
  createPatch(text: string): IPatch;
  getCursor(): ICursor;
  delete(): void;
}

export abstract class AbstractPatchTable implements IPatchTable {
  readonly creationTime: UTCMillis | undefined;
  protected latest: string;
  baseText: string;
  readonly patches: IPatch[];
  constructor(
    readonly ctx: IPatchContext,
    readonly uid: TableId | undefined,
    readonly direction: TableDir,
    patches: IPatch[] | undefined,
    baseText: string = "",
    creationTime?: number | undefined
  ) {
    this.baseText = baseText;
    this.latest = baseText;
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
    const prev = this.direction === "F" ? this.latest : text;
    const next = this.direction === "F" ? text : this.latest;
    const diffs = diff(prev, next);
    const patch = Patch.fromFastDiff(diffs);
    patch.tableRef = this.uid;
    this.patches.push(patch!);
    // this.baseText = text;
    return patch;
  }
  abstract getCursor(): ICursor;

  delete() {
    this.ctx.deleteTable(this);
  }
}
export class ForwardPatchTable extends AbstractPatchTable {
  constructor(
    readonly ctx: IPatchContext,
    readonly uid: TableId | undefined,
    patches: IPatch[] | undefined,
    baseText: string = "",
    creationTime?: number | undefined
  ) {
    super(ctx, uid, "F", patches, baseText, creationTime);
    this.latest = baseText;
  }
  createPatch(text: string): IPatch {
    const patch = super.createPatch(text);
    this.latest = text;
    return patch;
  }
  getCursor(): ICursor {
    return new Cursor(this.patches, 0, this.patches.length, this.baseText);
  }
}
/**
 *
 */
export class BackwardPatchTable extends AbstractPatchTable {
  constructor(
    readonly ctx: IPatchContext,
    readonly uid: TableId | undefined,
    patches: IPatch[] | undefined,
    baseText: string = "",
    creationTime?: number | undefined
  ) {
    super(ctx, uid, "B", patches, baseText, creationTime);
    this.latest = baseText;
  }
  createPatch(text: string): IPatch {
    const patch = super.createPatch(text);
    this.latest = this.baseText = text;
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
